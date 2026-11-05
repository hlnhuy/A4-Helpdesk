const routeGroups = {
  public: ['/welcome', '/login', '/request-account', '/forgot-password'],
  user: ['/user/dashboard', '/user/tickets', '/user/tickets/create', '/user/tickets/:ticketId', '/user/profile', '/user/help'],
  technician: ['/technician/dashboard', '/technician/tickets', '/technician/tickets/:ticketId', '/technician/profile'],
  admin: ['/admin/dashboard', '/admin/tickets', '/admin/tickets/:ticketId', '/admin/assignments', '/admin/users', '/admin/users/create', '/admin/users/:userId/edit', '/admin/categories', '/admin/reports', '/admin/change-password', '/admin/help']
};

export default routeGroups;
