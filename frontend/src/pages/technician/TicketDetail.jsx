import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import RoleLayout from '../../layouts/RoleLayout.jsx';
import Panel from '../../components/common/Panel.jsx';
import TicketDetails from '../../components/common/TicketDetails.jsx';
import TicketHistory from '../../components/common/TicketHistory.jsx';
import TicketTimeline from '../../components/common/TicketTimeline.jsx';
import TicketUpdateForm from '../../components/technician/TicketUpdateForm.jsx';
import Notification from '../../components/common/Notification.jsx';
import useAuth from '../../hooks/useAuth.js';
import useDemoData from '../../hooks/useDemoData.js';
import { addTicketComment, getTicket, updateTicket } from '../../services/ticketService.js';
import { getUsers } from '../../services/userService.js';

function readCommentAttachment(file) {
  if (!file) return Promise.resolve(null);
  if (file.size > 2 * 1024 * 1024) return Promise.reject(new Error('Tệp đính kèm phải nhỏ hơn 2 MB.'));
  if (!(file.type.startsWith('image/') && file.type !== 'image/svg+xml'
    || ['application/pdf', 'text/plain'].includes(file.type))) {
    return Promise.reject(new Error('Chỉ hỗ trợ ảnh, PDF hoặc tệp văn bản.'));
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ name: file.name, dataUrl: reader.result });
    reader.onerror = () => reject(new Error('Không thể đọc tệp đính kèm.'));
    reader.readAsDataURL(file);
  });
}

export default function TicketDetail() {
  const { ticketId } = useParams();
  const { user } = useAuth();
  const [ticket] = useDemoData(() => getTicket(ticketId));
  const [users] = useDemoData(getUsers);
  const checkedIn = users.find(account => account.id === user.id)?.checkedIn === true;
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [comment, setComment] = useState('');
  const [commentAttachment, setCommentAttachment] = useState(null);
  const commentFileInput = useRef(null);

  if (!ticket || (ticket.technicianId !== user.id && ticket.assistantTechnicianId !== user.id)) return <RoleLayout role="technician" title="Không tìm thấy phiếu"><Panel>Phiếu không tồn tại hoặc chưa được giao cho bạn.</Panel></RoleLayout>;

  function startWork() {
    if (!checkedIn) {
      setError('Bạn cần Check in bằng camera trước khi bắt đầu xử lý phiếu.');
      return;
    }
    try {
      updateTicket(ticket.id, current => {
        const now = new Date().toISOString();
        return { ...current, status: 'Đang xử lý', startedAt: now, history: [{ id: `${ticket.id}-${Date.now()}`, type: 'started', label: 'Tiếp nhận và bắt đầu xử lý', actor: user.full_name, createdAt: now }, ...current.history] };
      });
      setError('');
      setSuccess('Đã bắt đầu tiếp nhận phiếu.');
    } catch (actionError) { setSuccess(''); setError(actionError.message); }
  }

  function resolveTicket(resolution) {
    setSaving(true);
    try {
      updateTicket(ticket.id, current => {
        const now = new Date().toISOString();
        const event = resolution.note ? [{ id: `${ticket.id}-${Date.now()}-note`, type: 'note', label: `Ghi chú: ${resolution.note}`, actor: user.full_name, createdAt: now }] : [];
        return { ...current, status: 'Đã giải quyết', resolution, resolvedAt: now, history: [
          { id: `${ticket.id}-${Date.now()}`, type: 'resolved', label: `Đã giải quyết: ${resolution.action}`, actor: user.full_name, createdAt: now },
          ...event, ...current.history
        ] };
      });
      setError('');
      setSuccess('Đã lưu kết quả xử lý.');
    } catch (actionError) { setSuccess(''); setError(actionError.message); }
    finally { setSaving(false); }
  }

  async function sendComment(event) {
    event.preventDefault();
    if (saving) return;
    const form = event.currentTarget;
    setSaving(true);
    try {
      const attachment = await readCommentAttachment(commentAttachment);
      addTicketComment(ticket.id, user, comment, attachment);
      setComment('');
      setCommentAttachment(null);
      form.reset();
      setError('');
      setSuccess('Đã gửi nội dung trao đổi.');
    } catch (commentError) { setSuccess(''); setError(commentError.message); }
    finally { setSaving(false); }
  }

  return <RoleLayout role="technician" title={`Phiếu ${ticket.id}`}>
    <Link className="back-link" to="/technician/tickets">← Danh sách phiếu</Link>
    <Notification message={error} type="error" />
    <Notification message={success} type="success" />
    <div className="detail-grid">
      <div>
        <TicketDetails ticket={ticket} actions={ticket.status === 'Mới tiếp nhận'
          ? <button className="button button-primary detail-action" onClick={startWork} disabled={!checkedIn}>▶ Tiếp nhận &amp; bắt đầu xử lý</button>
          : ticket.status === 'Đang xử lý' && checkedIn ? <TicketUpdateForm ticket={ticket} onSave={resolveTicket} saving={saving} /> : null} />
        <Panel className="ticket-conversation">
          <h3>Trao đổi trong phiếu ({ticket.comments?.length || 0})</h3>
          <div className="conversation-messages">
            {(ticket.comments || []).map(message => <article className={message.actorId === user.id ? 'conversation-message own' : 'conversation-message'} key={message.id}>
              <strong>{message.actor} <small>{message.role === 'technician' ? 'KTV' : 'Người dùng'}</small></strong>
              {message.message && <p>{message.message}</p>}
              {message.attachment && <a className="attachment-link" href={message.attachment.dataUrl} download={message.attachment.name}>{message.attachment.name}</a>}
              <time>{new Date(message.createdAt).toLocaleString('vi-VN')}</time>
            </article>)}
            {!ticket.comments?.length && <p className="muted small">Chưa có nội dung trao đổi.</p>}
          </div>
          {!['Đã đóng'].includes(ticket.status) && <form className="conversation-form" onSubmit={sendComment}>
            <input aria-label="Nội dung trao đổi" value={comment} onChange={event => setComment(event.target.value)} maxLength="1000" placeholder="Viết trao đổi, bổ sung thông tin..." />
            <label className="conversation-attachment-button">Đính kèm<input ref={commentFileInput} aria-label="Tệp đính kèm trao đổi" type="file" accept="image/*,.pdf,.txt" onChange={event => setCommentAttachment(event.target.files?.[0] || null)} /></label>
            <button className="button button-primary" type="submit" disabled={saving || (!comment.trim() && !commentAttachment)}>{saving ? 'Đang gửi...' : 'Gửi'}</button>
          </form>}
          {commentAttachment && <p className="conversation-attachment-name">Tệp: {commentAttachment.name} <button type="button" className="text-button" onClick={() => { setCommentAttachment(null); if (commentFileInput.current) commentFileInput.current.value = ''; }}>Bỏ tệp</button></p>}
        </Panel>
      </div>
      {!checkedIn && ticket.status === 'Mới tiếp nhận' && <p className="muted small">Hãy Check in bằng camera trên bảng làm việc trước khi bắt đầu xử lý.</p>}
      {!checkedIn && ticket.status === 'Đang xử lý' && <p className="muted small">Bạn đã Check out. Hãy Check in bằng camera để tiếp tục xử lý phiếu.</p>}
      <div className="detail-aside"><TicketTimeline ticket={ticket} /><TicketHistory ticket={ticket} /></div>
    </div>
  </RoleLayout>;
}
