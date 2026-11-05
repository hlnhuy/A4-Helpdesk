const DATA_KEY = 'a4-helpdesk-demo-data';
const SESSION_KEY = 'a4-helpdesk-demo-session';
const CHANGE_EVENT = 'a4-helpdesk-demo-data-change';

const categoryNames = ['Wi-Fi', 'Internet', 'Mạng LAN', 'Thiết bị', 'Khác'];
const priorityLevels = ['Thấp', 'Trung bình', 'Cao', 'Khẩn cấp'];
const defaultSlaHours = { 'Thấp': 24, 'Trung bình': 8, 'Cao': 4, 'Khẩn cấp': 1 };
const defaultFaqs = [
  { id: 'faq-wifi', category: 'Wi-Fi', question: 'Không kết nối được Wi-Fi thì cần làm gì?', answer: 'Kiểm tra Wi-Fi trên thiết bị, thử kết nối lại và ghi rõ khu vực/phòng trong phiếu sự cố.' },
  { id: 'faq-internet', category: 'Internet', question: 'Mạng Internet chậm cần cung cấp thông tin gì?', answer: 'Ghi vị trí, thời điểm gặp lỗi và những dịch vụ bị ảnh hưởng để kỹ thuật viên kiểm tra.' },
  { id: 'faq-lan', category: 'Mạng LAN', question: 'Cổng LAN không có tín hiệu?', answer: 'Kiểm tra dây mạng và cổng kết nối; không tự tháo thiết bị mạng. Gửi phiếu kèm vị trí cổng.' },
  { id: 'faq-device', category: 'Thiết bị', question: 'Máy chiếu không lên hình?', answer: 'Kiểm tra nguồn điện, dây kết nối và nguồn vào đang chọn; gửi phiếu nếu vẫn không có hình.' },
  { id: 'faq-account', category: 'Tài khoản', question: 'Quên mật khẩu tài khoản Helpdesk?', answer: 'Dùng chức năng Quên mật khẩu ở trang đăng nhập để gửi yêu cầu Admin hỗ trợ.' }
];
const initialUsers = [
  { id: 'admin', user_code: 'admin', full_name: 'Nguyễn Quản Trị', email: 'admin@a4.edu.vn', role: 'admin', status: 'active', password: 'admin123', mustChangePassword: false, skills: [] },
  { id: 'ktv1', user_code: 'ktv1', full_name: 'Nguyễn Văn Hùng', email: 'hung.nv@a4.edu.vn', role: 'technician', status: 'active', password: 'ktv123', skills: ['Wi-Fi', 'Internet', 'Mạng LAN'], available: false, checkedIn: false, attendanceHistory: [] },
  { id: 'ktv2', user_code: 'ktv2', full_name: 'Trần Thị Mai', email: 'mai.tt@a4.edu.vn', role: 'technician', status: 'active', password: 'ktv123', skills: ['Thiết bị', 'Khác'], available: false, checkedIn: false, attendanceHistory: [] },
  { id: 'ktv3', user_code: 'ktv3', full_name: 'Lê Quốc Bảo', email: 'bao.lq@a4.edu.vn', role: 'technician', status: 'active', password: 'ktv123', skills: ['Mạng LAN', 'Thiết bị', 'Wi-Fi'], available: false, checkedIn: false, attendanceHistory: [] },
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
  const technicians = [
    { id: 'ktv1', name: 'Nguyễn Văn Hùng', skills: ['Wi-Fi', 'Internet', 'Mạng LAN'] },
    { id: 'ktv2', name: 'Trần Thị Mai', skills: ['Thiết bị', 'Khác'] },
    { id: 'ktv3', name: 'Lê Quốc Bảo', skills: ['Mạng LAN', 'Thiết bị', 'Wi-Fi'] }
  ];
  const requesters = ['Phạm Minh Anh', 'Đỗ Thu Hà', 'Võ Thanh Tùng'];
  return Array.from({ length: 27 }, (_, index) => {
    const [title, category, location, priority, initialStatus] = ticketTemplates[index % ticketTemplates.length];
    const status = index === 0 ? initialStatus : (index < 9 ? 'Đang xử lý' : index < 19 ? 'Đã giải quyết' : 'Đã đóng');
    const id = `HD-${String(27 - index).padStart(4, '0')}`;
    const createdAt = new Date(Date.UTC(2026, 9, 30 - Math.floor(index / 2), 14 - index % 12, 6));
    const qualifiedTechnicians = technicians.filter(technician => technician.skills.includes(category));
    const technician = qualifiedTechnicians[index % qualifiedTechnicians.length];
    const requester = requesters[index % requesters.length];
    const history = [{ id: `${id}-created`, type: 'created', label: 'Tạo phiếu sự cố', actor: requester, createdAt: createdAt.toISOString() }];
    if (technician) history.unshift({ id: `${id}-assigned`, type: 'assigned', label: `Phân công cho ${technician.name}`, actor: 'Hệ thống', createdAt: createdAt.toISOString() });
    if (['Đang xử lý', 'Đã giải quyết', 'Đã đóng'].includes(status)) history.unshift({ id: `${id}-started`, type: 'started', label: 'Tiếp nhận và bắt đầu xử lý', actor: technician.name, createdAt: new Date(createdAt.getTime() + 60_000).toISOString() });
    if (['Đã giải quyết', 'Đã đóng'].includes(status)) history.unshift({ id: `${id}-resolved`, type: 'resolved', label: 'Đã giải quyết sự cố', actor: technician.name, createdAt: new Date(createdAt.getTime() + 4 * 60_000).toISOString() });
    if (status === 'Đã đóng') history.unshift({ id: `${id}-closed`, type: 'closed', label: 'Đóng phiếu', actor: requester, createdAt: new Date(createdAt.getTime() + 5 * 60_000).toISOString() });
    return {
      id, title, category, location, priority, status, requester, requesterId: `user${index % 3 + 1}`,
      technician: technician.name, technicianId: technician.id,
      description: index === 0 ? 'Cả lớp 40 sinh viên không vào được Wi-Fi, đang có giờ thực hành.' : `Sự cố ${title.toLowerCase()} tại ${location}.`,
      createdAt: createdAt.toISOString(),
      slaAt: new Date(createdAt.getTime() + defaultSlaHours[priority] * 60 * 60_000).toISOString(),
      startedAt: ['Đang xử lý', 'Đã giải quyết', 'Đã đóng'].includes(status) ? new Date(createdAt.getTime() + 60_000).toISOString() : null,
      resolvedAt: ['Đã giải quyết', 'Đã đóng'].includes(status) ? new Date(createdAt.getTime() + 4 * 60_000).toISOString() : null,
      closedAt: status === 'Đã đóng' ? new Date(createdAt.getTime() + 5 * 60_000).toISOString() : null,
      resolution: status === 'Đã giải quyết' || status === 'Đã đóng'
        ? { cause: 'Access point bị treo firmware', action: 'Khởi động lại và cập nhật cấu hình', result: 'Wi-Fi hoạt động bình thường', note: '' }
        : null,
      attachments: [], history
    };
  });
}

function createInitialData() {
  return {
    users: initialUsers.map(user => ({ ...user, skills: [...user.skills], attendanceHistory: [...(user.attendanceHistory || [])] })),
    pendingAccounts: [{ id: 'request-1', full_name: 'Hoàng Gia Bảo', email: 'bao.hg@a4.edu.vn', role: 'user', note: 'Sinh viên năm 2, cần tài khoản gửi phiếu', createdAt: '2026-10-30T04:06:00.000Z' }],
    passwordRequests: [],
    faqs: defaultFaqs.map(faq => ({ ...faq })),
    tickets: seedTickets(),
    categories: [...categoryNames],
    settings: { nextUserId: 4, slaHours: { ...defaultSlaHours }, autoAssign: true }
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
    data.pendingAccounts ||= [];
    data.passwordRequests ||= [];
    data.faqs ||= defaultFaqs.map(faq => ({ ...faq }));
    data.settings ||= {};
    data.settings.nextUserId ||= data.users.length + 1;
    data.settings.slaHours = { ...defaultSlaHours, ...(data.settings.slaHours || {}) };
    if (typeof data.settings.autoAssign !== 'boolean') data.settings.autoAssign = true;
    data.users = data.users.map(user => user.role === 'technician' && typeof user.checkedIn !== 'boolean'
      ? { ...user, checkedIn: false, available: false, attendanceHistory: [] }
      : user);
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
      data.users.push({ ...nextUser, id, user_code: id, status: 'active', password: nextUser.password || 'welcome123', mustChangePassword: true, skills: nextUser.skills || [] });
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

export function deleteUser(userId) {
  return mutateData(data => {
    const user = data.users.find(item => item.id === userId);
    if (!user) throw new Error('Không tìm thấy tài khoản.');
    if (user.role === 'admin') throw new Error('Không thể xóa tài khoản Admin.');

    data.tickets = data.tickets.map(ticket => ({
      ...ticket,
      requesterId: ticket.requesterId === userId ? null : ticket.requesterId,
      technicianId: ticket.technicianId === userId ? null : ticket.technicianId,
      technician: ticket.technicianId === userId ? 'Chưa phân công' : ticket.technician,
      assistantTechnicianId: ticket.assistantTechnicianId === userId ? null : ticket.assistantTechnicianId,
      assistantTechnician: ticket.assistantTechnicianId === userId ? '' : ticket.assistantTechnician
    }));
    data.passwordRequests = data.passwordRequests.filter(request => request.userId !== userId);
    data.users = data.users.filter(item => item.id !== userId);
    return data;
  });
}

export function resetUserPassword(userId, password = 'welcome123') {
  return mutateData(data => {
    if (!data.users.some(user => user.id === userId)) throw new Error('Không tìm thấy tài khoản.');
    data.users = data.users.map(user => user.id === userId ? { ...user, password, mustChangePassword: true } : user);
    return data;
  });
}

export function changePassword(userId, currentPassword, nextPassword) {
  if (typeof nextPassword !== 'string' || nextPassword.length < 8) {
    throw new Error('Mật khẩu mới phải có ít nhất 8 ký tự.');
  }
  return mutateData(data => {
    const account = data.users.find(user => user.id === userId);
    if (!account || account.password !== currentPassword) throw new Error('Mật khẩu hiện tại không chính xác.');
    account.password = nextPassword;
    account.mustChangePassword = false;
    return data;
  });
}

export function requestAccount({ full_name, email, note }) {
  const normalizedEmail = String(email || '').trim().toLocaleLowerCase();
  const normalizedName = String(full_name || '').trim();
  if (!normalizedName || !normalizedEmail) throw new Error('Vui lòng nhập họ tên và email.');
  return mutateData(data => {
    if (data.users.some(user => user.email.toLocaleLowerCase() === normalizedEmail)
      || data.pendingAccounts.some(request => request.email.toLocaleLowerCase() === normalizedEmail)) {
      throw new Error('Email đã có tài khoản hoặc đang chờ duyệt.');
    }
    data.pendingAccounts.push({
      id: `request-${Date.now()}`,
      full_name: normalizedName,
      email: normalizedEmail,
      role: 'user',
      note: String(note || '').trim(),
      createdAt: new Date().toISOString()
    });
    return data;
  });
}

export function getPendingAccounts() {
  return readData().pendingAccounts;
}

export function getPasswordRequests() {
  return readData().passwordRequests;
}

export function requestPasswordReset(identifier) {
  const normalized = String(identifier || '').trim().toLocaleLowerCase();
  if (!normalized) throw new Error('Vui lòng nhập mã tài khoản hoặc email.');
  return mutateData(data => {
    const account = data.users.find(user => user.user_code.toLocaleLowerCase() === normalized
      || user.email.toLocaleLowerCase() === normalized);
    if (account && !data.passwordRequests.some(request => request.userId === account.id)) {
      data.passwordRequests.push({
        id: `password-request-${Date.now()}`,
        userId: account.id,
        user_code: account.user_code,
        full_name: account.full_name,
        email: account.email,
        createdAt: new Date().toISOString()
      });
    }
    return data;
  });
}

export function resolvePasswordRequest(requestId, password = 'welcome123') {
  return mutateData(data => {
    const request = data.passwordRequests.find(item => item.id === requestId);
    if (!request) throw new Error('Không tìm thấy yêu cầu đặt lại mật khẩu.');
    const account = data.users.find(user => user.id === request.userId);
    if (!account) throw new Error('Tài khoản của yêu cầu không còn tồn tại.');
    account.password = password;
    account.mustChangePassword = true;
    data.passwordRequests = data.passwordRequests.filter(item => item.id !== requestId);
    return data;
  });
}

export function approveAccount(requestId, password = 'welcome123') {
  let createdAccount;
  mutateData(data => {
    const request = data.pendingAccounts.find(item => item.id === requestId);
    if (!request) throw new Error('Không tìm thấy yêu cầu cấp tài khoản.');
    if (data.users.some(user => user.email.toLocaleLowerCase() === request.email.toLocaleLowerCase())) {
      throw new Error('Email này đã được cấp tài khoản.');
    }
    const id = `user${data.settings.nextUserId++}`;
    createdAccount = { id, user_code: id, full_name: request.full_name, email: request.email, role: request.role, status: 'active', password, mustChangePassword: true, skills: [] };
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
    const now = new Date().toISOString();
    created = {
      ...payload, id, priority: null, status: 'Mới tiếp nhận', requester: actor.full_name, requesterId: actor.id,
      technician: 'Chưa phân công', technicianId: null,
      createdAt: now, slaAt: null,
      startedAt: null, resolvedAt: null, resolution: null,
      history: [
        { id: `${id}-priority-pending`, type: 'priority-pending', label: 'Phiếu chờ Admin duyệt mức độ ưu tiên', actor: 'Hệ thống', createdAt: now },
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
    const slaHours = readData().settings.slaHours[priority];
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
  return assignTicketTeam(ticketId, technicianId, null, actorName);
}

export function assignTicketTeam(ticketId, technicianId, assistantTechnicianId, actorName = 'Nguyễn Quản Trị') {
  const technician = getUsers().find(user => user.id === technicianId && user.role === 'technician'
    && user.status === 'active' && user.checkedIn === true);
  if (!technician) throw new Error('Chỉ có thể phân công cho kỹ thuật viên đang Check in.');
  const assistant = assistantTechnicianId
    ? getUsers().find(user => user.id === assistantTechnicianId && user.role === 'technician'
      && user.status === 'active' && user.checkedIn === true)
    : null;
  if (assistantTechnicianId && !assistant) throw new Error('Kỹ thuật viên hỗ trợ phải đang hoạt động và Check in.');
  if (assistant?.id === technician.id) throw new Error('Kỹ thuật viên chính và hỗ trợ phải là hai người khác nhau.');
  return updateTicket(ticketId, ticket => {
    if (!ticket.priority) throw new Error('Admin cần duyệt mức độ ưu tiên trước khi phân công kỹ thuật viên.');
    if (!(technician.skills || []).includes(ticket.category)) throw new Error('Kỹ thuật viên chưa được khai báo chuyên môn phù hợp với phiếu.');
    const now = new Date().toISOString();
    const history = [{
      id: `${ticket.id}-${Date.now()}-assigned`,
      type: 'assigned',
      label: `Phân công KTV phụ trách ${technician.full_name}${assistant ? ` và KTV hỗ trợ ${assistant.full_name}` : ''}`,
      actor: actorName,
      createdAt: now
    }, ...ticket.history];
    return {
      ...ticket,
      technicianId: technician.id,
      technician: technician.full_name,
      assistantTechnicianId: assistant?.id || null,
      assistantTechnician: assistant?.full_name || '',
      history
    };
  });
}

export function updateTechnicianAttendance(userId, action) {
  if (!['check-in', 'check-out'].includes(action)) throw new Error('Thao tác chấm công không hợp lệ.');
  return mutateData(data => {
    const technician = data.users.find(user => user.id === userId && user.role === 'technician' && user.status === 'active');
    if (!technician) throw new Error('Không tìm thấy tài khoản kỹ thuật viên đang hoạt động.');
    if (action === 'check-in' && technician.checkedIn) throw new Error('Bạn đã check in.');
    if (action === 'check-out' && !technician.checkedIn) throw new Error('Bạn chưa check in.');
    const now = new Date().toISOString();
    technician.checkedIn = action === 'check-in';
    technician.available = technician.checkedIn;
    technician.checkedInAt = technician.checkedIn ? now : null;
    technician.lastCheckedOutAt = technician.checkedIn ? technician.lastCheckedOutAt || null : now;
    technician.attendanceHistory = [
      { action, createdAt: now },
      ...(technician.attendanceHistory || [])
    ].slice(0, 100);
    return data;
  });
}

export function unassignTicket(ticketId, actorName = 'Nguyễn Quản Trị') {
  return updateTicket(ticketId, ticket => {
    const now = new Date().toISOString();
    return {
      ...ticket, technician: 'Chưa phân công', technicianId: null,
      assistantTechnician: '', assistantTechnicianId: null,
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

export function exportCsv(tickets) {
  const headers = ['Mã phiếu', 'Tiêu đề', 'Loại sự cố', 'Vị trí', 'Ưu tiên', 'Trạng thái', 'Người gửi', 'KTV phụ trách', 'KTV hỗ trợ', 'Ngày tạo'];
  const fields = ['id', 'title', 'category', 'location', 'priority', 'status', 'requester', 'technician', 'assistantTechnician', 'createdAt'];
  const csv = [headers, ...tickets.map(ticket => fields.map(field => field === 'priority' ? ticket.priority || 'Chưa duyệt' : ticket[field] ?? ''))]
    .map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\r\n');
  return `\uFEFF${csv}`;
}

export function getSystemSettings() {
  const { slaHours, autoAssign } = readData().settings;
  return { slaHours: { ...defaultSlaHours, ...slaHours }, autoAssign };
}

export function getFaqs() {
  return readData().faqs;
}

export function addFaq({ category, question, answer }) {
  const normalizedQuestion = String(question || '').trim();
  const normalizedAnswer = String(answer || '').trim();
  if (!normalizedQuestion || !normalizedAnswer) throw new Error('Vui lòng nhập câu hỏi và câu trả lời.');
  return mutateData(data => {
    if (!data.categories.includes(category) && category !== 'Tài khoản') {
      throw new Error('Nhóm hướng dẫn không hợp lệ.');
    }
    const faq = { id: `faq-${Date.now()}`, category, question: normalizedQuestion, answer: normalizedAnswer };
    data.faqs.push(faq);
    return data;
  });
}

export function deleteFaq(faqId) {
  return mutateData(data => {
    if (!data.faqs.some(faq => faq.id === faqId)) throw new Error('Không tìm thấy câu hỏi cần xóa.');
    data.faqs = data.faqs.filter(faq => faq.id !== faqId);
    return data;
  });
}

export function addTicketComment(ticketId, actor, message, attachment = null) {
  const text = String(message || '').trim();
  if (!text && !attachment) throw new Error('Vui lòng nhập nội dung trao đổi hoặc đính kèm tệp.');
  if (text.length > 1000) throw new Error('Nội dung trao đổi không được vượt quá 1000 ký tự.');
  if (attachment && (typeof attachment.name !== 'string' || typeof attachment.dataUrl !== 'string'
    || !/^data:(image\/(?!svg\+xml)[^;,]+|application\/pdf|text\/plain);base64,/.test(attachment.dataUrl)
    || attachment.dataUrl.length > 2_800_000)) {
    throw new Error('Tệp đính kèm không hợp lệ.');
  }
  return updateTicket(ticketId, ticket => {
    const isRequester = ticket.requesterId === actor.id;
    const isAssignedTechnician = ticket.technicianId === actor.id || ticket.assistantTechnicianId === actor.id;
    if (!isRequester && !isAssignedTechnician) throw new Error('Bạn không có quyền trao đổi trong phiếu này.');
    const comment = {
      id: `${ticketId}-comment-${Date.now()}`,
      actorId: actor.id,
      actor: actor.full_name,
      role: actor.role,
      message: text,
      attachment,
      createdAt: new Date().toISOString()
    };
    return { ...ticket, comments: [...(ticket.comments || []), comment] };
  });
}

export function reviewTicket(ticketId, actor, rating, feedback) {
  const score = Number(rating);
  if (!Number.isInteger(score) || score < 1 || score > 5) throw new Error('Vui lòng chọn mức đánh giá từ 1 đến 5.');
  return updateTicket(ticketId, ticket => {
    if (ticket.requesterId !== actor.id) throw new Error('Bạn không có quyền đánh giá phiếu này.');
    if (ticket.status !== 'Đã giải quyết') throw new Error('Chỉ có thể đánh giá phiếu đã giải quyết.');
    const now = new Date().toISOString();
    return {
      ...ticket,
      status: 'Đã đóng',
      closedAt: now,
      review: { rating: score, feedback: String(feedback || '').trim(), createdAt: now },
      history: [{ id: `${ticketId}-review-${Date.now()}`, type: 'closed', label: `Người gửi xác nhận kết quả và đánh giá ${score}/5`, actor: actor.full_name, createdAt: now }, ...ticket.history]
    };
  });
}

export function requestTicketReopen(ticketId, actor, message) {
  const text = String(message || '').trim();
  if (!text) throw new Error('Vui lòng nhập lý do yêu cầu xử lý lại.');
  if (text.length > 1000) throw new Error('Lý do yêu cầu xử lý lại không được vượt quá 1000 ký tự.');
  return updateTicket(ticketId, ticket => {
    if (ticket.requesterId !== actor.id) throw new Error('Bạn không có quyền yêu cầu xử lý lại phiếu này.');
    if (ticket.status !== 'Đã giải quyết') throw new Error('Chỉ có thể yêu cầu xử lý lại phiếu đã giải quyết.');
    const now = new Date().toISOString();
    const event = { id: `${ticketId}-reopened-${Date.now()}`, type: 'reopened', label: text ? `Yêu cầu xử lý lại: ${text}` : 'Người gửi yêu cầu xử lý lại', actor: actor.full_name, createdAt: now };
    return {
      ...ticket,
      status: 'Đang xử lý',
      resolvedAt: null,
      resolution: null,
      reopenedAt: now,
      history: [event, ...ticket.history]
    };
  });
}

export { categoryNames, defaultSlaHours, priorityLevels };
