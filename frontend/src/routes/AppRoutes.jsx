import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute.jsx';
import PublicLayout from '../layouts/PublicLayout.jsx';
import Home from '../pages/public/Home.jsx';
import Login from '../pages/auth/Login.jsx';
import UserDashboard from '../pages/user/Dashboard.jsx';
import CreateTicket from '../pages/user/CreateTicket.jsx';
import MyTickets from '../pages/user/MyTickets.jsx';
import UserTicketDetail from '../pages/user/TicketDetail.jsx';
import UserProfile from '../pages/user/Profile.jsx';
import TechnicianDashboard from '../pages/technician/Dashboard.jsx';
import AssignedTickets from '../pages/technician/AssignedTickets.jsx';
import TechnicianTicketDetail from '../pages/technician/TicketDetail.jsx';
import TechnicianProfile from '../pages/technician/Profile.jsx';
import AdminDashboard from '../pages/admin/Dashboard.jsx';
import AdminTickets from '../pages/admin/Tickets.jsx';
import AdminTicketDetail from '../pages/admin/TicketDetail.jsx';
import Assignments from '../pages/admin/Assignments.jsx';
import Users from '../pages/admin/Users.jsx';
import CreateUser from '../pages/admin/CreateUser.jsx';
import EditUser from '../pages/admin/EditUser.jsx';
import Categories from '../pages/admin/Categories.jsx';
import Reports from '../pages/admin/Reports.jsx';
import AdminProfile from '../pages/admin/Profile.jsx';
import NotFound from '../pages/public/NotFound.jsx';

function Protected({ roles, children }) {
  return <ProtectedRoute roles={roles}>{children}</ProtectedRoute>;
}

export default function AppRoutes() {
  return <Routes>
    <Route path="/" element={<Navigate to="/welcome" replace />} />
    <Route path="/welcome" element={<PublicLayout><Home /></PublicLayout>} />
    <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />

    <Route path="/user/dashboard" element={<Protected roles={['user']}><UserDashboard /></Protected>} />
    <Route path="/user/tickets" element={<Protected roles={['user']}><MyTickets /></Protected>} />
    <Route path="/user/tickets/create" element={<Protected roles={['user']}><CreateTicket /></Protected>} />
    <Route path="/user/tickets/:ticketId" element={<Protected roles={['user']}><UserTicketDetail /></Protected>} />
    <Route path="/user/profile" element={<Protected roles={['user']}><UserProfile /></Protected>} />

    <Route path="/technician/dashboard" element={<Protected roles={['technician']}><TechnicianDashboard /></Protected>} />
    <Route path="/technician/tickets" element={<Protected roles={['technician']}><AssignedTickets /></Protected>} />
    <Route path="/technician/tickets/:ticketId" element={<Protected roles={['technician']}><TechnicianTicketDetail /></Protected>} />
    <Route path="/technician/profile" element={<Protected roles={['technician']}><TechnicianProfile /></Protected>} />

    <Route path="/admin/dashboard" element={<Protected roles={['admin']}><AdminDashboard /></Protected>} />
    <Route path="/admin/tickets" element={<Protected roles={['admin']}><AdminTickets /></Protected>} />
    <Route path="/admin/tickets/:ticketId" element={<Protected roles={['admin']}><AdminTicketDetail /></Protected>} />
    <Route path="/admin/assignments" element={<Protected roles={['admin']}><Assignments /></Protected>} />
    <Route path="/admin/users" element={<Protected roles={['admin']}><Users /></Protected>} />
    <Route path="/admin/users/create" element={<Protected roles={['admin']}><CreateUser /></Protected>} />
    <Route path="/admin/users/:userId/edit" element={<Protected roles={['admin']}><EditUser /></Protected>} />
    <Route path="/admin/categories" element={<Protected roles={['admin']}><Categories /></Protected>} />
    <Route path="/admin/reports" element={<Protected roles={['admin']}><Reports /></Protected>} />
    <Route path="/admin/profile" element={<Protected roles={['admin']}><AdminProfile /></Protected>} />

    <Route path="*" element={<NotFound />} />
  </Routes>;
}

export const routeGroups = {
  public: ['/welcome', '/login'],
  user: ['/user/dashboard', '/user/tickets', '/user/tickets/create', '/user/tickets/:ticketId', '/user/profile'],
  technician: ['/technician/dashboard', '/technician/tickets', '/technician/tickets/:ticketId', '/technician/profile'],
  admin: ['/admin/dashboard', '/admin/tickets', '/admin/assignments', '/admin/users', '/admin/users/create', '/admin/categories', '/admin/reports', '/admin/profile']
};
