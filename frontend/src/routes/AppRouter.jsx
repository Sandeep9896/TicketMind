import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import ProtectedRoute from '../components/common/ProtectedRoute';
import { useAuth } from '../hooks/useAuth';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import AdminLoginPage from '../pages/auth/AdminLoginPage';
import AgentLoginPage from '../pages/auth/AgentLoginPage';
import AgentRegisterPage from '../pages/auth/AgentRegisterPage';
import LandingPage from '../pages/common/LandingPage';
import NotFoundPage from '../pages/common/NotFoundPage';
import CreateTicketPage from '../pages/user/CreateTicketPage';
import MyTicketsPage from '../pages/user/MyTicketsPage';
import UserDashboardPage from '../pages/user/UserDashboardPage';
import UserProfilePage from '../pages/user/UserProfilePage';
import UserChatbotPage from '../pages/user/UserChatbotPage';
import UserTicketCommunicationPage from '../pages/user/UserTicketCommunicationPage';
import AgentDashboardPage from '../pages/agent/AgentDashboardPage';
import AgentIncomingTicketsPage from '../pages/agent/AgentIncomingTicketsPage';
import AgentCommunicationPage from '../pages/agent/AgentCommunicationPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminAllTicketsPage from '../pages/admin/AdminAllTicketsPage';
import AdminAssignTicketsPage from '../pages/admin/AdminAssignTicketsPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';

const RoleHomeRedirect = () => {
  const { user } = useAuth();

  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (user?.role === 'agent') {
    return <Navigate to="/agent/dashboard" replace />;
  }

  return <Navigate to="/user/dashboard" replace />;
};

const PublicHomeRoute = () => {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <LandingPage />;
};

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/agent/login" element={<AgentLoginPage />} />
      <Route path="/agent/register" element={<AgentRegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<RoleHomeRedirect />} />

          <Route path="/tickets/create" element={<Navigate to="/user/create-ticket" replace />} />
          <Route path="/tickets/my" element={<Navigate to="/user/dashboard" replace />} />
          <Route path="/admin-dashboard" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/agent-panel" element={<Navigate to="/agent/dashboard" replace />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['user']} />}>
        <Route element={<AppShell />}>
          <Route path="/user/dashboard" element={<UserDashboardPage />} />
          <Route path="/user/create-ticket" element={<CreateTicketPage />} />
          <Route path="/user/profile" element={<UserProfilePage />} />
          <Route path="/user/chatbot" element={<UserChatbotPage />} />
          <Route path="/user/chatbot/:ticketId" element={<UserChatbotPage />} />
          <Route path="/user/my-tickets" element={<MyTicketsPage />} />
          <Route path="/user/ticket/:ticketId/communication" element={<UserTicketCommunicationPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['agent']} />}>
        <Route element={<AppShell />}>
          <Route path="/agent/dashboard" element={<AgentDashboardPage />} />
          <Route path="/agent/incoming-tickets" element={<AgentIncomingTicketsPage />} />
          <Route path="/agent/communication" element={<AgentCommunicationPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<AppShell />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/all-tickets" element={<AdminAllTicketsPage />} />
          <Route path="/admin/assign-tickets" element={<AdminAssignTicketsPage />} />
        </Route>
      </Route>

      <Route path="/" element={<PublicHomeRoute />} />
      <Route path="*" element={<NotFoundPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />}
/>
    </Routes>
  );
};

export default AppRouter;
