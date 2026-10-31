import { getTickets } from './demoDataService.js';

export function getDashboardReport() {
  const tickets = getTickets();
  const statuses = ['Mới tiếp nhận','Đang xử lý','Đã giải quyết','Đã đóng'];
  return {
    total: tickets.length,
    overdue: tickets.filter(ticket => !['Đã giải quyết','Đã đóng'].includes(ticket.status) && new Date(ticket.slaAt) < new Date()).length,
    byStatus: statuses.map(status => ({ status, count: tickets.filter(ticket => ticket.status === status).length })),
    byCategory: [...new Set(tickets.map(ticket => ticket.category))].map(category => ({ category, count: tickets.filter(ticket => ticket.category === category).length }))
  };
}
