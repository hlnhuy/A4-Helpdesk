import { useState } from 'react';
import Panel from '../../components/common/Panel.jsx';
import Notification from '../../components/common/Notification.jsx';
import RoleLayout from '../../layouts/RoleLayout.jsx';
import useDemoData from '../../hooks/useDemoData.js';
import { defaultSlaHours, exportDemoBackup, getSystemSettings, resetDemoData, restoreDemoBackup, saveSystemSettings } from '../../services/demoDataService.js';

export default function Settings() {
  const [settings, refresh] = useDemoData(getSystemSettings);
  const [feedback, setFeedback] = useState({ message: '', type: 'success' });
  const [slaHours, setSlaHours] = useState(settings.slaHours);
  const [autoAssign, setAutoAssign] = useState(settings.autoAssign);

  function save() {
    try {
      saveSystemSettings({ slaHours, autoAssign });
      setSlaHours(current => Object.fromEntries(Object.entries(current).map(([priority, hours]) => [priority, Number(hours)])));
      refresh();
      setFeedback({ message: 'Đã lưu cấu hình.', type: 'success' });
    } catch (error) {
      setFeedback({ message: error.message, type: 'error' });
    }
  }

  function submitSettings(event) {
    event.preventDefault();
    save();
  }

  function downloadBackup() {
    const blob = new Blob([exportDemoBackup()], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `a4-helpdesk-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function importBackup(event) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setFeedback({ message: 'Tệp sao lưu không được vượt quá 5 MB.', type: 'error' });
      input.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        restoreDemoBackup(String(reader.result || ''));
        const restoredSettings = getSystemSettings();
        setSlaHours(restoredSettings.slaHours);
        setAutoAssign(restoredSettings.autoAssign);
        refresh();
        setFeedback({ message: 'Đã khôi phục dữ liệu từ tệp sao lưu.', type: 'success' });
      } catch (error) {
        setFeedback({ message: error.message, type: 'error' });
      } finally {
        input.value = '';
      }
    };
    reader.onerror = () => setFeedback({ message: 'Không thể đọc tệp sao lưu.', type: 'error' });
    reader.readAsText(file);
  }

  function reset() {
    if (!window.confirm('Khôi phục dữ liệu demo ban đầu? Dữ liệu hiện tại sẽ bị thay thế.')) return;
    resetDemoData();
    const initialSettings = getSystemSettings();
    setSlaHours(initialSettings.slaHours);
    setAutoAssign(initialSettings.autoAssign);
    refresh();
    setFeedback({ message: 'Đã khôi phục dữ liệu demo ban đầu.', type: 'success' });
  }

  return <RoleLayout role="admin" title="Cấu hình hệ thống">
    <Notification message={feedback.message} type={feedback.type} />
    <div className="settings-grid">
      <Panel>
        <h2>Thời hạn xử lý (SLA) theo mức ưu tiên</h2>
        <p className="muted small">Phiếu quá hạn được cảnh báo và tính vào báo cáo SLA. Áp dụng cho phiếu được duyệt ưu tiên từ sau khi lưu cấu hình.</p>
        <form className="settings-form" onSubmit={submitSettings}>
          {Object.keys(defaultSlaHours).map(priority => <label className="field" key={priority}>{priority} — số giờ tối đa
            <input type="number" min="1" max="720" step="1" required value={slaHours[priority]} onChange={event => setSlaHours(current => ({ ...current, [priority]: event.target.value }))} />
          </label>)}
          <button className="button button-primary" type="submit">Lưu cấu hình SLA</button>
        </form>
      </Panel>
      <div className="settings-side">
        <Panel>
          <h2>Tự động hóa</h2>
          <label className="settings-toggle"><span><strong>Gợi ý kỹ thuật viên tự động</strong><small>Sau khi duyệt mức ưu tiên, hệ thống chọn sẵn KTV đã Check in, đúng chuyên môn và có ít phiếu đang mở nhất. Admin vẫn cần bấm “Lưu” để giao phiếu.</small></span>
            <input type="checkbox" checked={autoAssign} onChange={event => setAutoAssign(event.target.checked)} />
          </label>
          <p><StatusBadgeText enabled={autoAssign} /></p>
          <button className="button button-primary" type="button" onClick={save}>Lưu cấu hình gợi ý</button>
        </Panel>
        <Panel>
          <h2>Sao lưu &amp; khôi phục dữ liệu</h2>
          <p className="muted small">Xuất dữ liệu demo ra JSON hoặc khôi phục từ tệp sao lưu đã tạo.</p>
          <p className="backup-warning">Tệp JSON chứa thông tin tài khoản và mật khẩu demo. Chỉ lưu ở nơi an toàn, không chia sẻ công khai.</p>
          <div className="backup-actions">
            <button className="button button-secondary" type="button" onClick={downloadBackup}>⬇ Sao lưu (JSON)</button>
            <label className="button button-secondary">⬆ Khôi phục tệp<input type="file" accept="application/json,.json" onChange={importBackup} hidden /></label>
            <button className="button button-danger" type="button" onClick={reset}>↻ Dữ liệu demo ban đầu</button>
          </div>
        </Panel>
      </div>
    </div>
  </RoleLayout>;
}

function StatusBadgeText({ enabled }) {
  return <span className={`automation-status ${enabled ? 'enabled' : 'disabled'}`}>{enabled ? '● Đang bật gợi ý KTV' : '● Đang tắt gợi ý KTV'}</span>;
}
