# Quy trình xử lý

Mới tiếp nhận → Đang xử lý → Đã giải quyết → Đã đóng.

Admin cấp tài khoản; người dùng gửi yêu cầu cấp tài khoản hoặc đặt lại mật khẩu khi cần. Người dùng đăng nhập, chọn loại sự cố, vị trí, mô tả và tệp đính kèm để tạo phiếu; Admin duyệt mức độ ưu tiên.

Sau khi gửi, phiếu có mức ưu tiên “Chưa duyệt” và chưa được giao cho kỹ thuật viên. Admin chọn mức ưu tiên, chọn KTV phụ trách đã Check in và đúng chuyên môn, có thể chọn thêm KTV hỗ trợ thuộc bất kỳ chuyên môn nào, rồi bấm “Lưu” để hoàn tất phân công. KTV đang xử lý phiếu khác được đánh dấu “Bận” nhưng vẫn có thể được chọn để hỗ trợ. Chỉ sau khi lưu, cả KTV phụ trách và hỗ trợ mới thấy phiếu và có thể tham gia xử lý. Admin có thể cập nhật ưu tiên hoặc người phụ trách. Kỹ thuật viên cập nhật nguyên nhân, biện pháp và kết quả; người gửi theo dõi lịch sử và xác nhận đóng phiếu.

Mã QR dùng chung mở đăng nhập rồi chuyển đến biểu mẫu tạo phiếu; vị trí vẫn do người gửi nhập. Các báo cáo lấy thời gian từ các mốc được ghi trong dữ liệu demo.

Kỹ thuật viên phải mở camera và chụp ảnh khuôn mặt để Check in khi bắt đầu ca, hoặc Check out khi nghỉ. Chỉ KTV đã Check in mới được nhận phiếu hoặc bắt đầu/tiếp tục xử lý. Bản demo không lưu ảnh và không xác minh danh tính bằng nhận diện khuôn mặt; camera cần HTTPS (hoặc localhost).

Admin có thể theo dõi phiếu ở Kanban, cấu hình SLA và gợi ý KTV tự động (Admin vẫn xác nhận phân công bằng nút Lưu), sao lưu/khôi phục dữ liệu demo và quản lý kho FAQ. KTV cập nhật phiếu từ Kanban hoặc trang chi tiết; người gửi và KTV có thể trao đổi trong phiếu. Người gửi đánh giá/đóng phiếu đã giải quyết hoặc yêu cầu xử lý lại.
