import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './i18n';
import { useInterfaceStore } from './features/interface/store';
import { useThemeColors } from './hooks/useThemeColors';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './features/dashboard/DashboardPage';
import ClientsPage from './features/clients/ClientsPage';
import ServicesPage from './features/services/ServicesPage';
import AppointmentsPage from './features/appointments/AppointmentsPage';
import AppointmentHistoryPage from './features/appointments/AppointmentHistoryPage';
import TeamPage from './features/team/TeamPage';
import ProductsPage from './features/services/ProductsPage';
import InterfacePage from './features/interface/InterfacePage';
import ProfilePage from './features/profile/ProfilePage';
import { PublicAppointmentManager } from './features/public/components/PublicAppointmentManager';
import PublicAppointmentList from './features/public/components/PublicAppointmentList';
import SalonPage from './features/public/SalonPage';
import DepositReturn from './features/public/components/DepositReturn';
import WaitlistManagePage from './features/public/WaitlistManagePage';
import { SubscriptionPage } from './features/subscription/SubscriptionPage';
import { Toast } from './components/Toast';
import { LoginPage } from './features/auth/pages/LoginPage';
import { RegisterPage } from './features/auth/pages/RegisterPage';
import { ForgotPasswordPage } from './features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from './features/auth/pages/ResetPasswordPage';
import { VerifyEmailPage } from './features/auth/pages/VerifyEmailPage';
import { AuthGuard, PublicOnlyGuard } from './features/auth/components/AuthGuard';
import ErrorBoundary from './components/ErrorBoundary';
import LandingPage from './features/marketing/pages/LandingPage';
import PricingPage from './features/marketing/pages/PricingPage';
import DirectoryPage from './features/directory/DirectoryPage';
import AdminPage from './features/admin/AdminPage';

// Dev server only: every public layout variant on one page (/dev/layouts).
const DevLayouts = import.meta.env.DEV ? React.lazy(() => import('./features/public/dev/LayoutsPage')) : null;

export const App: React.FC = () => {
  const { t } = useTranslation('common');
  const checkImages = useInterfaceStore((state) => state.checkImages);
  
  // Apply theme colors
  useThemeColors();

  useEffect(() => {
    checkImages();
  }, [checkImages]);

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
        {/* Marketing routes - MUST BE FIRST to catch "/" */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/salons/:a?/:b?" element={<DirectoryPage />} />
        <Route path="/login" element={<Navigate to="/auth/login" replace />} />
        <Route path="/register" element={<Navigate to="/auth/register" replace />} />

        {/* Public routes */}
        <Route path="salon/:slug" element={<SalonPage />} />
        <Route path="salon/:slug/appointments/list" element={<PublicAppointmentList />} />
        <Route path="appointment/:token" element={<PublicAppointmentManager />} />
        {/* SATIM sends the client back here after paying an online deposit */}
        <Route path="booking/payment-return" element={<DepositReturn />} />
        <Route path="waitlist/:token" element={<WaitlistManagePage />} />
        {/* Alias used by emails */}
        <Route path="modify-appointment/:token" element={<PublicAppointmentManager />} />
        <Route path="appointments/list" element={<PublicAppointmentList />} />
        {DevLayouts && <Route path="dev/layouts" element={<React.Suspense fallback={null}><DevLayouts /></React.Suspense>} />}
        {/* Targets of the password-reset and verification e-mails */}
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="verify-email" element={<VerifyEmailPage />} />

        {/* Authentication routes */}
        <Route path="auth" element={<PublicOnlyGuard />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Route>

        {/* Protected routes */}
        <Route element={<AuthGuard />}>
          <Route element={<MainLayout />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="appointments" element={<AppointmentsPage />} />
            <Route path="appointments/history" element={<AppointmentHistoryPage />} />
            <Route path="team" element={<TeamPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="interface" element={<InterfacePage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="subscription" element={<SubscriptionPage />} />
            <Route path="admin" element={<AdminPage />} />
          </Route>
        </Route>

        {/* Default redirection */}
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toast />
      </Router>
    </ErrorBoundary>
  );
};

export default App;
