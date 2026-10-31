export default function TicketFilters({ query, onQueryChange, status, onStatusChange, category, onCategoryChange, categories }) {
  return <div className="ticket-filters">
    <input aria-label="Tìm phiếu" placeholder="Tìm theo mã, tiêu đề, vị trí..." value={query} onChange={event => onQueryChange(event.target.value)} />
    <select aria-label="Lọc trạng thái" value={status} onChange={event => onStatusChange(event.target.value)}>
      <option value="">Mọi trạng thái</option>{['Mới tiếp nhận','Đang xử lý','Đã giải quyết','Đã đóng'].map(item => <option key={item}>{item}</option>)}
    </select>
    <select aria-label="Lọc loại sự cố" value={category} onChange={event => onCategoryChange(event.target.value)}>
      <option value="">Mọi loại sự cố</option>{categories.map(item => <option key={item}>{item}</option>)}
    </select>
  </div>;
}
