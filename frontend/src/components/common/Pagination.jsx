export default function Pagination({ page, pageCount, onPageChange }) {
  if (pageCount <= 1) return null;
  return <nav className="pagination" aria-label="Phân trang">
    <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Trước</button>
    <span>Trang {page} / {pageCount}</span>
    <button type="button" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>Sau</button>
  </nav>;
}
