import { useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import RoleLayout from '../../layouts/RoleLayout.jsx';
import Panel from '../../components/common/Panel.jsx';
import TicketDetails from '../../components/common/TicketDetails.jsx';
import TicketTimeline from '../../components/common/TicketTimeline.jsx';
import TicketHistory from '../../components/common/TicketHistory.jsx';
import Notification from '../../components/common/Notification.jsx';
import useAuth from '../../hooks/useAuth.js';
import useDemoData from '../../hooks/useDemoData.js';
import { addTicketComment, getTicket, requestTicketReopen, reviewTicket } from '../../services/ticketService.js';

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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [comment, setComment] = useState('');
  const [commentAttachment, setCommentAttachment] = useState(null);
  const commentFileInput = useRef(null);
  const [rating, setRating] = useState('');
  const [feedback, setFeedback] = useState('');

  const ownTicket = useMemo(() => ticket?.requesterId === user.id, [ticket, user.id]);
  if (!ticket || !ownTicket) return <RoleLayout role="user" title="Không tìm thấy phiếu"><Panel>Phiếu không tồn tại hoặc bạn không có quyền xem.</Panel></RoleLayout>;

  function closeTicket() {
    if (saving) return;
    setSaving(true);
    try {
      reviewTicket(ticket.id, user, rating, feedback);
      setError('');
      setSuccess('Đã xác nhận kết quả và đóng phiếu.');
    } catch (updateError) { setSuccess(''); setError(updateError.message); }
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

  function reopenTicket() {
    if (saving) return;
    setSaving(true);
    try {
      requestTicketReopen(ticket.id, user, feedback);
      setFeedback('');
      setError('');
      setSuccess('Đã gửi yêu cầu xử lý lại. Kết quả xử lý hiện tại được xóa và lưu trong lịch sử phiếu.');
    } catch (reopenError) { setSuccess(''); setError(reopenError.message); }
    finally { setSaving(false); }
  }

  return <RoleLayout role="user" title={`Phiếu ${ticket.id}`}>
    <Link className="back-link" to="/user/tickets">← Danh sách phiếu</Link>
    <Notification message={error} type="error" />
    <Notification message={success} type="success" />
    <div className="panel ticket-status-guidance" role="status">
      {ticket.status === 'Mới tiếp nhận' && !ticket.priority
        ? 'Phiếu đã gửi và đang chờ Admin duyệt mức độ ưu tiên, sau đó phân công kỹ thuật viên.'
        : ticket.status === 'Mới tiếp nhận' && ticket.technicianId
          ? `Phiếu đã được phân công cho ${ticket.technician}${ticket.assistantTechnician ? ` và KTV hỗ trợ ${ticket.assistantTechnician}` : ''}. Kỹ thuật viên sẽ Check in rồi tiếp nhận xử lý.`
          : ticket.status === 'Mới tiếp nhận'
            ? 'Phiếu đang chờ Admin phân công kỹ thuật viên.'
            : ticket.status === 'Đang xử lý'
              ? 'Kỹ thuật viên đang xử lý phiếu. Bạn có thể bổ sung thông tin tại phần trao đổi.'
              : ticket.status === 'Đã giải quyết'
                ? 'Kỹ thuật viên đã cập nhật kết quả. Hãy đánh giá và xác nhận đóng phiếu, hoặc nêu lý do nếu cần xử lý lại.'
                : 'Phiếu đã đóng.'}
    </div>
    <div className="detail-grid">
      <div>
        <TicketDetails ticket={ticket} actions={ticket.status === 'Đã giải quyết' && <div className="ticket-feedback-actions">
          <label className="field">Đánh giá kết quả
            <select value={rating} onChange={event => setRating(event.target.value)} required>
              <option value="">Chọn số sao</option>
              {[5, 4, 3, 2, 1].map(score => <option value={score} key={score}>{'★'.repeat(score)} ({score}/5)</option>)}
            </select>
          </label>
          <label className="field">Ý kiến phản hồi / lý do xử lý lại<textarea rows="2" maxLength="1000" value={feedback} onChange={event => setFeedback(event.target.value)} placeholder="Chia sẻ cảm nhận hoặc nêu lý do nếu cần xử lý lại..." /></label>
          <div className="feedback-buttons">
            <button className="button button-primary" type="button" onClick={closeTicket} disabled={!rating || saving}>{saving ? 'Đang lưu...' : '✓ Xác nhận & đánh giá'}</button>
            <button className="button button-danger" type="button" onClick={reopenTicket} disabled={!feedback.trim() || saving}>{saving ? 'Đang gửi...' : '↻ Yêu cầu xử lý lại'}</button>
          </div>
        </div>} />
        {ticket.review && <Panel><h3>Đánh giá của bạn</h3><p className="review-stars">{'★'.repeat(ticket.review.rating)}{'☆'.repeat(5 - ticket.review.rating)} <strong>{ticket.review.rating}/5</strong></p>{ticket.review.feedback && <p>{ticket.review.feedback}</p>}</Panel>}
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
      <div className="detail-aside"><TicketTimeline ticket={ticket} /><TicketHistory ticket={ticket} /></div>
    </div>
  </RoleLayout>;
}
