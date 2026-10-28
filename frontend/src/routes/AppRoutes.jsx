// Các route theo vai trò sẽ được tập trung tại file này khi mở rộng ứng dụng.
export const routeGroups = {
  public: ['/', '/login'],
  user: ['/user/dashboard', '/user/tickets', '/user/tickets/create'],
  technician: ['/technician/dashboard', '/technician/tickets'],
  admin: ['/admin/dashboard', '/admin/users', '/admin/users/create']
};
