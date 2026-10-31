const DATA_KEY = 'a4-helpdesk-demo-data';
const SESSION_KEY = 'a4-helpdesk-demo-session';
const CHANGE_EVENT = 'a4-helpdesk-demo-data-change';

const categoryNames = ['Wi-Fi', 'Internet', 'Mạng LAN', 'Thiết bị', 'Khác'];
const priorityLevels = ['Thấp', 'Trung bình', 'Cao', 'Khẩn cấp'];
const prioritySlaHours = { 'Thấp': 24, 'Trung bình': 8, 'Cao': 4, 'Khẩn cấp': 1 };

const initialUsers = [
  { id: 'admin', user_code: 'admin', full_name: 'Nguyễn Quản Trị', email: 'admin@a4.edu.vn', role: 'admin', status: 'active', password: 'admin123', skills: [] },
  { id: 'ktv1', user_code: 'ktv1', full_name: 'Nguyễn Văn Hùng', email: 'hung.nv@a4.edu.vn', role: 'technician', status: 'active', password: 'ktv123', skills: ['Wi-Fi', 'Internet', 'Mạng LAN'], available: true },
  { id: 'ktv2', user_code: 'ktv2', full_name: 'Trần Thị Mai', email: 'mai.tt@a4.edu.vn', role: 'technician', status: 'active', password: 'ktv123', skills: ['Thiết bị', 'Khác'], available: true },
  { id: 'ktv3', user_code: 'ktv3', full_name: 'Lê Quốc Bảo', email: 'bao.lq@a4.edu.vn', role: 'technician', status: 'active', password: 'ktv123', skills: ['Mạng LAN', 'Thiết bị', 'Wi-Fi'], available: true },
  { id: 'user1', user_code: 'user1', full_name: 'Phạm Minh Anh', email: 'anh.pm@a4.edu.vn', role: 'user', status: 'active', password: 'user123', skills: [] },
  { id: 'user2', user_code: 'user2', full_name: 'Đỗ Thu Hà', email: 'ha.dt@a4.edu.vn', role: 'user', status: 'active', password: 'user123', skills: [] },
  { id: 'user3', user_code: 'user3', full_name: 'Võ Thanh Tùng', email: 'tung.vt@a4.edu.vn', role: 'user', status: 'active', password: 'user123', skills: [] }
];

const ticketTemplates = [
  ['Wi-Fi phòng A4-201 không kết nối được', 'Wi-Fi', 'A4-201', 'Khẩn cấp', 'Mới tiếp nhận'],
  ['Wi-Fi bị rớt liên tục', 'Wi-Fi', 'A4-102', 'Trung bình', 'Đang xử lý'],
  ['Cổng LAN không nhận tín hiệu', 'Mạng LAN', 'A4-101', 'Khẩn cấp', 'Đã đóng'],
  ['Máy tính không khởi động', 'Thiết bị', 'A4-202', 'Khẩn cấp', 'Đang xử lý'],
  ['Internet chậm giờ cao điểm', 'Internet', 'A4-301', 'Thấp', 'Đã đóng'],
  ['Quên mật khẩu tài khoản email trường', 'Khác', 'Thư viện', 'Thấp', 'Đã giải quyết'],
  ['Cần cài phần mềm giảng dạy', 'Khác', 'A4-202', 'Trung bình', 'Đang xử lý'],
  ['Không bắt được Wi-Fi sinh viên', 'Wi-Fi', 'A4-301', 'Trung bình', 'Đã giải quyết'],
  ['Internet chậm giờ cao điểm', 'Internet', 'A4-101', 'Cao', 'Đã giải quyết']
];

function seedTickets() {
  const technicians = ['Nguyễn Văn Hùng', 'Trần Thị Mai', 'Lê Quốc Bảo'];
  const requesters = ['Phạm Minh Anh', 'Đỗ Thu Hà', 'Võ Thanh Tùng'];
  return Array.from({ length: 27 }, (_, index) => {
    const [title, category, location, priority, initialStatus] = ticketTemplates[index % ticketTemplates.length];
    const status = index === 0 ? initialStatus : (index < 9 ? 'Đang xử lý' : index < 19 ? 'Đã giải quyết' : 'Đã đóng');
    const id = `HD-${String(27 - index).padStart(4, '0')}`;
    const createdAt = new Date(Date.UTC(2026, 9, 30 - Math.floor(index / 2), 14 - index % 12, 6));
    const technician = technicians[index % technicians.length];
    const requester = requesters[index % requesters.length];
    const history = [{ id: `${id}-created`, type: 'created', label: 'Tạo phiếu sự cố', actor: requester, createdAt: createdAt.toISOString() }];
    if (technician) history.unshift({ id: `${id}-assigned`, type: 'assigned', label: `Phân công cho ${technician}`, actor: 'Hệ thống', createdAt: createdAt.toISOString() });
    if (['Đang xử lý', 'Đã giải quyết', 'Đã đóng'].includes(status)) history.unshift({ id: `${id}-started`, type: 'started', label: 'Tiếp nhận và bắt đầu xử lý', actor: technician, createdAt: new Date(createdAt.getTime() + 60_000).toISOString() });
    if (['Đã giải quyết', 'Đã đóng'].includes(status)) history.unshift({ id: `${id}-resolved`, type: 'resolved', label: 'Đã giải quyết sự cố', actor: technician, createdAt: new Date(createdAt.getTime() + 4 * 60_000).toISOString() });
    return {
      id, title, category, location, priority, status, requester, requesterId: `user${index % 3 + 1}`,
      technician, technicianId: `ktv${index % 3 + 1}`,
      description: index === 0 ? 'Cả lớp 40 sinh viên không vào được Wi-Fi, đang có giờ thực hành.' : `Sự cố ${title.toLowerCase()} tại ${location}.`,
      createdAt: createdAt.toISOString(),
      slaAt: new Date(createdAt.getTime() + 60 * 60_000).toISOString(),
      startedAt: ['Đang xử lý', 'Đã giải quyết', 'Đã đóng'].includes(status) ? new Date(createdAt.getTime() + 60_000).toISOString() : null,
      resolvedAt: ['Đã giải quyết', 'Đã đóng'].includes(status) ? new Date(createdAt.getTime() + 4 * 60_000).toISOString() : null,
      resolution: status === 'Đã giải quyết' || status === 'Đã đóng'
        ? { cause: 'Access point bị treo firmware', action: 'Khởi động lại và cập nhật cấu hình', result: 'Wi-Fi hoạt động bình thường', note: '' }
        : null,
      attachments: [], history
    };
  });
}

function createInitialData() {
  return {
    users: initialUsers,
    pendingAccounts: [{ id: 'request-1', full_name: 'Hoàng Gia Bảo', email: 'bao.hg@a4.edu.vn', role: 'user', note: 'Sinh viên năm 2, cần tài khoản gửi phiếu', createdAt: '2026-10-30T04:06:00.000Z' }],
    tickets: seedTickets(),
    categories: categoryNames,
    settings: { nextUserId: 4 }
  };
}

function readData() {
  const stored = localStorage.getItem(DATA_KEY);
  if (!stored) {
    const initialData = createInitialData();
    localStorage.setItem(DATA_KEY, JSON.stringify(initialData));
    return initialData;
  }
  try {
    const data = JSON.parse(stored);
    if (!Array.isArray(data.users) || !Array.isArray(data.tickets) || !Array.isArray(data.categories)) {
      throw new Error('Dữ liệu demo không đúng định dạng.');
    }
    return data;
  } catch (error) {
    throw new Error(`Không đọc được dữ liệu Helpdesk trong trình duyệt: ${error.message}`);
  }
}

function writeData(data) {
  localStorage.setItem(DATA_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event(CHANGE_EVENT));
  return data;
}

function mutateData(mutator) {
  const current = readData();
  const next = mutator(current);
  writeData(next);
  return next;
}

export function subscribeToData(listener) {
  window.addEventListener(CHANGE_EVENT, listener);
  window.addEventListener('storage', listener);
  return () => {
    window.removeEventListener(CHANGE_EVENT, listener);
    window.removeEventListener('storage', listener);
  };
}

export function getUsers() {
  return readData().users;
}

export function saveUser(user) {
  return mutateData(data => {
    const nextUser = { ...user };
    const duplicate = data.users.find(existing => existing.id !== nextUser.id && (
      existing.user_code.toLocaleLowerCase() === String(nextUser.user_code || '').toLocaleLowerCase()
      || existing.email.toLocaleLowerCase() === String(nextUser.email || '').toLocaleLowerCase()
    ));
    if (duplicate) throw new Error('Mã tài khoản hoặc email đã được sử dụng.');
    if (nextUser.id) {
      data.users = data.users.map(existing => existing.id === nextUser.id ? { ...existing, ...nextUser } : existing);
    } else {
      const id = `user${data.settings.nextUserId++}`;
      data.users.push({ ...nextUser, id, user_code: id, status: 'active', password: nextUser.password || 'welcome123', skills: nextUser.skills || [] });
    }
    return data;
  });
}

export function setUserStatus(userId, status) {
  return mutateData(data => {
    data.users = data.users.map(user => user.id === userId ? { ...user, status } : user);
    return data;
  });
}

export function resetUserPassword(userId, password = 'welcome123') {
  return mutateData(data => {
    data.users = data.users.map(user => user.id === userId ? { ...user, password } : user);
    return data;
  });
}

export function getPendingAccounts() {
  return readData().pendingAccounts;
}

export function approveAccount(requestId, password = 'welcome123') {
  let createdAccount;
  mutateData(data => {
    const request = data.pendingAccounts.find(item => item.id === requestId);
    if (!request) throw new Error('Không tìm thấy yêu cầu cấp tài khoản.');
    const id = `user${data.settings.nextUserId++}`;
    createdAccount = { id, user_code: id, full_name: request.full_name, email: request.email, role: request.role, status: 'active', password, skills: [] };
    data.users.push(createdAccount);
    data.pendingAccounts = data.pendingAccounts.filter(item => item.id !== requestId);
    return data;
  });
  return createdAccount;
}

export function declineAccount(requestId) {
  return mutateData(data => {
    data.pendingAccounts = data.pendingAccounts.filter(item => item.id !== requestId);
    return data;
  });
}

export function getCategories() {
  return readData().categories;
}

export function saveCategory(name) {
  const category = name.trim();
  if (!category) throw new Error('Vui lòng nhập tên chuyên môn.');
  return mutateData(data => {
    if (data.categories.some(item => item.toLocaleLowerCase() === category.toLocaleLowerCase())) {
      throw new Error('Chuyên môn này đã tồn tại.');
    }
    data.categories.push(category);
    return data;
  });
}

export function renameCategory(oldName, nextName) {
  const category = nextName.trim();
  if (!category) throw new Error('Vui lòng nhập tên chuyên môn.');
  if (oldName === category) return;
  return mutateData(data => {
    if (data.categories.some(item => item !== oldName && item.toLocaleLowerCase() === category.toLocaleLowerCase())) {
      throw new Error('Chuyên môn này đã tồn tại.');
    }
    if (!data.categories.includes(oldName)) throw new Error('Không tìm thấy chuyên môn cần sửa.');
    data.categories = data.categories.map(item => item === oldName ? category : item);
    data.tickets = data.tickets.map(ticket => ticket.category === oldName ? { ...ticket, category } : ticket);
    data.users = data.users.map(user => ({ ...user, skills: (user.skills || []).map(skill => skill === oldName ? category : skill) }));
    return data;
  });
}

export function deleteCategory(name) {
  return mutateData(data => {
    if (data.tickets.some(ticket => ticket.category === name)) throw new Error('Không thể xóa loại sự cố đang được phiếu sử dụng.');
    data.categories = data.categories.filter(item => item !== name);
    data.users = data.users.map(user => ({ ...user, skills: (user.skills || []).filter(skill => skill !== name) }));
    return data;
  });
}

export function getTickets() {
  return [...readData().tickets].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getTicket(ticketId) {
  return readData().tickets.find(ticket => ticket.id === ticketId) || null;
}

export function createTicket(payload, actor) {
  let created;
  mutateData(data => {
    const lastId = Math.max(27, ...data.tickets.map(ticket => Number(ticket.id.replace(/\D/g, '')) || 0));
    const id = `HD-${String(lastId + 1).padStart(4, '0')}`;
    const technicians = data.users.filter(user => user.role === 'technician' && user.status === 'active' && user.available !== false);
    const matches = technicians.filter(user => (user.skills || []).includes(payload.category));
    const pool = matches;
    const load = technician => data.tickets.filter(ticket => ticket.technicianId === technician.id && ticket.status === 'Đang xử lý').length;
    const assignee = [...pool].sort((a, b) => load(a) - load(b))[0];
    const now = new Date().toISOString();
    created = {
      ...payload, id, priority: null, status: 'Mới tiếp nhận', requester: actor.full_name, requesterId: actor.id,
      technician: assignee?.full_name || 'Chưa phân công', technicianId: assignee?.id || null,
      createdAt: now, slaAt: null,
      startedAt: null, resolvedAt: null, resolution: null,
      history: [
        ...(assignee ? [{ id: `${id}-assigned`, type: 'assigned', label: `Tự động phân công cho ${assignee.full_name}`, actor: 'Hệ thống', createdAt: now }] : []),
        { id: `${id}-priority-pending`, type: 'priority-pending', label: 'Phiếu chờ admin duyệt mức độ ưu tiên', actor: 'Hệ thống', createdAt: now },
        { id: `${id}-created`, type: 'created', label: 'Tạo phiếu sự cố', actor: actor.full_name, createdAt: now }
      ]
    };
    data.tickets.push(created);
    return data;
  });
  return created;
}

export function updateTicket(ticketId, updater) {
  let updated = null;
  mutateData(data => {
    const index = data.tickets.findIndex(ticket => ticket.id === ticketId);
    if (index < 0) throw new Error('Không tìm thấy phiếu sự cố.');
    updated = updater({ ...data.tickets[index] });
    data.tickets[index] = updated;
    return data;
  });
  return updated;
}

export function updateTicketPriority(ticketId, priority, actorName = 'Quản trị viên') {
  if (!priorityLevels.includes(priority)) throw new Error('Vui lòng chọn mức độ ưu tiên hợp lệ.');
  return updateTicket(ticketId, ticket => {
    const now = new Date().toISOString();
    const slaHours = prioritySlaHours[priority];
    const slaAt = new Date(new Date(ticket.createdAt).getTime() + slaHours * 60 * 60_000).toISOString();
    return {
      ...ticket,
      priority,
      slaAt,
      priorityApprovedAt: now,
      history: [{
        id: `${ticket.id}-priority-${Date.now()}`,
        type: 'priority-approved',
        label: `Admin duyệt mức độ ưu tiên: ${priority}`,
        actor: actorName,
        createdAt: now
      }, ...ticket.history]
    };
  });
}

export function assignTicket(ticketId, technicianId, actorName = 'Nguyễn Quản Trị') {
  const technician = getUsers().find(user => user.id === technicianId && user.role === 'technician' && user.status === 'active');
  if (!technician) throw new Error('Vui lòng chọn kỹ thuật viên đang hoạt động.');
  return updateTicket(ticketId, ticket => ({
    ...ticket, technicianId, technician: technician.full_name,
    history: [{ id: `${ticket.id}-${Date.now()}`, type: 'assigned', label: `Phân công cho ${technician.full_name}`, actor: actorName, createdAt: new Date().toISOString() }, ...ticket.history]
  }));
}

export function unassignTicket(ticketId, actorName = 'Nguyễn Quản Trị') {
  return updateTicket(ticketId, ticket => {
    const now = new Date().toISOString();
    return {
      ...ticket, technician: 'Chưa phân công', technicianId: null,
      history: [{ id: `${ticket.id}-${Date.now()}`, type: 'unassigned', label: 'Hủy phân công kỹ thuật viên', actor: actorName, createdAt: now }, ...ticket.history]
    };
  });
}

export function updateTechnicianSkills(userId, skills) {
  return mutateData(data => {
    data.users = data.users.map(user => user.id === userId ? { ...user, skills } : user);
    return data;
  });
}

export function getSession() {
  const stored = localStorage.getItem(SESSION_KEY);
  return stored ? JSON.parse(stored) : null;
}

export function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function findAccount(identifier) {
  const normalized = identifier.trim().toLocaleLowerCase();
  return readData().users.find(user => user.user_code.toLocaleLowerCase() === normalized || user.email.toLocaleLowerCase() === normalized);
}

export function resetDemoData() {
  writeData(createInitialData());
}

export function exportCsv(tickets) {
  const headers = ['Mã phiếu', 'Tiêu đề', 'Loại sự cố', 'Vị trí', 'Ưu tiên', 'Trạng thái', 'Người gửi', 'Kỹ thuật viên', 'Ngày tạo'];
  const fields = ['id', 'title', 'category', 'location', 'priority', 'status', 'requester', 'technician', 'createdAt'];
  const csv = [headers, ...tickets.map(ticket => fields.map(field => field === 'priority' ? ticket.priority || 'Chờ duyệt' : ticket[field] ?? ''))]
    .map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\r\n');
  return `\uFEFF${csv}`;
}

export { categoryNames, priorityLevels };
