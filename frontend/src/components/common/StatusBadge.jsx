const tones = {
  'Mới tiếp nhận': 'blue',
  'Đang xử lý': 'orange',
  'Đã giải quyết': 'green',
  'Đã đóng': 'gray',
  'Khẩn cấp': 'red',
  'Cao': 'red',
  'Trung bình': 'blue',
  'Thấp': 'gray',
  'Chưa duyệt': 'gray',
  'Hoạt động': 'green',
  'Đã khóa': 'gray',
  'Sẵn sàng': 'green',
  'Bận': 'orange',
  'Đã Check in': 'green',
  'Đã Check out': 'gray'
};

export default function StatusBadge({ children, value = children }) {
  return <span className={`badge badge-${tones[value] || 'blue'}`}>{value}</span>;
}
