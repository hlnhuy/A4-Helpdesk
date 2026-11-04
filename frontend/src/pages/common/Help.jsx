import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import RoleLayout from '../../layouts/RoleLayout.jsx';
import Notification from '../../components/common/Notification.jsx';
import Panel from '../../components/common/Panel.jsx';
import useAuth from '../../hooks/useAuth.js';
import useDemoData from '../../hooks/useDemoData.js';
import { getCategories } from '../../services/categoryService.js';
import { addFaq, deleteFaq, getFaqs } from '../../services/demoDataService.js';

export default function Help() {
  const { user } = useAuth();
  const [faqs] = useDemoData(getFaqs);
  const [incidentCategories] = useDemoData(getCategories);
  const faqCategories = useMemo(() => ['Tất cả', ...new Set([...incidentCategories, 'Tài khoản'])], [incidentCategories]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Tất cả');
  const [form, setForm] = useState({ category: 'Wi-Fi', question: '', answer: '' });
  const [feedback, setFeedback] = useState({ message: '', type: 'success' });
  const visible = useMemo(() => faqs.filter(faq => category === 'Tất cả' || faq.category === category)
    .filter(faq => `${faq.question} ${faq.answer}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())),
  [faqs, category, query]);
  const canEdit = user.role === 'admin';

  function submit(event) {
    event.preventDefault();
    try {
      addFaq(form);
      setForm(current => ({ ...current, question: '', answer: '' }));
      setFeedback({ message: 'Đã thêm câu hỏi vào hướng dẫn.', type: 'success' });
    } catch (error) {
      setFeedback({ message: error.message, type: 'error' });
    }
  }

  function remove(faqId) {
    try {
      deleteFaq(faqId);
      setFeedback({ message: 'Đã xóa câu hỏi.', type: 'success' });
    } catch (error) {
      setFeedback({ message: error.message, type: 'error' });
    }
  }

  return <RoleLayout role={user.role} title="Hướng dẫn & câu hỏi thường gặp">
    <Notification message={feedback.message} type={feedback.type} />
    <Panel>
      <div className="faq-toolbar">
        <input aria-label="Tìm câu hỏi" placeholder="🔎 Tìm câu hỏi..." value={query} onChange={event => setQuery(event.target.value)} />
        <div className="faq-category-list">{faqCategories.map(item => <button type="button" className={category === item ? 'selected' : ''} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div>
      </div>
      <div className="faq-list">
        {visible.map(faq => <article className="faq-item" key={faq.id}>
          <details>
            <summary><span>{faq.category}</span><strong>{faq.question}</strong></summary>
            <p>{faq.answer}</p>
          </details>
          {canEdit && <button className="button button-danger faq-delete" type="button" onClick={() => remove(faq.id)}>Xóa</button>}
        </article>)}
        {!visible.length && <p className="empty-message">Không tìm thấy câu hỏi phù hợp.</p>}
      </div>
    </Panel>
    {canEdit && <Panel>
      <h2>Thêm câu hỏi mới</h2>
      <form className="faq-form" onSubmit={submit}>
        <label className="field">Nhóm<select value={form.category} onChange={event => setForm(current => ({ ...current, category: event.target.value }))}>{faqCategories.slice(1).map(item => <option key={item}>{item}</option>)}</select></label>
        <label className="field">Câu hỏi *<input value={form.question} onChange={event => setForm(current => ({ ...current, question: event.target.value }))} maxLength="200" required /></label>
        <label className="field faq-answer">Câu trả lời / hướng dẫn *<textarea rows="4" value={form.answer} onChange={event => setForm(current => ({ ...current, answer: event.target.value }))} maxLength="2000" required /></label>
        <button className="button button-primary" type="submit">Thêm vào kho hướng dẫn</button>
      </form>
    </Panel>}
    {user.role === 'user' && <Panel className="help-create-ticket"><span>Không tìm thấy cách khắc phục? Hãy gửi phiếu để kỹ thuật viên hỗ trợ.</span><Link className="button button-primary" to="/user/tickets/create">Báo sự cố</Link></Panel>}
  </RoleLayout>;
}
