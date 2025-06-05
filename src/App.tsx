import { useState, useEffect } from 'react';
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
import LoadingFallback from './components/ui/LoadingFallback';
import { useAuth } from './hooks/useAuth';

function App() {
  const { isAuthenticated, loading, user } = useAuth();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [forceLoad, setForceLoad] = useState(false);
  const isAdmin = user?.role === 'admin';

  // Add timeout for loading state to prevent infinite loading
  useEffect(() => {
    if (loading) {
      console.log('🔄 App loading started...');
      const timeoutId = setTimeout(() => {
        console.warn('⏰ Loading timeout reached, showing fallback options');
        setLoadingTimeout(true);
      }, 8000); // 8 second timeout

      return () => clearTimeout(timeoutId);
    } else {
      console.log('✅ App loading completed');
      setLoadingTimeout(false);
    }
  }, [loading]);

  // Show loading fallback with timeout options
  if (loading && !forceLoad) {
    return (
      <LoadingFallback
        message={loadingTimeout ? "Loading is taking longer than expected..." : "Initializing TeleMedicine AI Helper..."}
        timeout={loadingTimeout}
        onForceLoad={() => {
          console.log('🚀 Force loading app...');
          setForceLoad(true);
        }}
      />
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
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} loading={loading} />}>
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