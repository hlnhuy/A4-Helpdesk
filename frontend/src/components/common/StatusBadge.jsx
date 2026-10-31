const tones = {
  'Mới tiếp nhận': 'blue',
  'Đang xử lý': 'orange',
  'Đã giải quyết': 'green',
  'Đã đóng': 'gray',
  'Khẩn cấp': 'red',
  'Cao': 'red',
  'Trung bình': 'blue',
  'Thấp': 'gray',
  'Hoạt động': 'green',
  'Đã khóa': 'gray',
  'Sẵn sàng': 'green',
  'Bận': 'orange'
};

export default function StatusBadge({ children, value = children }) {
  return <span className={`badge badge-${tones[value] || 'blue'}`}>{value}</span>;
}
