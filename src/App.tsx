import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import EmailVerificationPage from './pages/auth/EmailVerificationPage';
import PasswordResetPage from './pages/auth/PasswordResetPage';
import Dashboard from './pages/dashboard/Dashboard';
import AppointmentsPage from './pages/appointments/AppointmentsPage';
import ConsultationPage from './pages/consultation/ConsultationPage';
import MedicalRecordsPage from './pages/records/MedicalRecordsPage';
import ChatbotPage from './pages/chatbot/ChatbotPage';
import ChatPage from './pages/chat/ChatPage';
import PrescriptionsPage from './pages/prescriptions/PrescriptionsPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import ProfilePage from './pages/profile/ProfilePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuth } from './hooks/useAuth';

function App() {
  const { isAuthenticated, loading, user } = useAuth();
  const isAdmin = user?.role === 'admin';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse-slow text-primary-500 text-xl font-medium">
          Loading TeleMed AI...
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="auth/verify" element={<EmailVerificationPage />} />
        <Route path="auth/confirm" element={<EmailVerificationPage />} />
        <Route path="verify" element={<EmailVerificationPage />} />
        <Route path="reset-password" element={<PasswordResetPage />} />
        <Route path="auth/reset-password" element={<PasswordResetPage />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="consultation/:id" element={<ConsultationPage />} />
          <Route path="medical-records" element={<MedicalRecordsPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="chat/:channelUrl" element={<ChatPage />} />
          <Route path="chatbot" element={<ChatbotPage />} />
          <Route path="prescriptions" element={<PrescriptionsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          
          {/* Admin Routes */}
          {isAdmin && (
            <Route path="admin" element={<AdminDashboard />} />
          )}
        </Route>
      </Route>
    </Routes>
  );
}

export default App;