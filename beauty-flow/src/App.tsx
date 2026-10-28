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
import EmployeeFilePage from './features/team/EmployeeFilePage';
import InvitationPage from './features/staff/InvitationPage';
import MyPlanningPage from './features/staff/MyPlanningPage';
import MyLeavesPage from './features/staff/MyLeavesPage';
import MyProfilePage from './features/staff/MyProfilePage';
import { Allowed, OwnerOnly, StaffOnly } from './features/staff/RouteGuards';

// Dev server only: every public layout variant on one page (/dev/layouts).
const DevLayouts = import.meta.env.DEV ? React.lazy(() => import('./features/public/dev/LayoutsPage')) : null;
// Supplier marketplace: loaded on demand (salons never download the supplier space)
const SupplierSpace = React.lazy(() => import('./features/marketplace/supplier/SupplierSpace'));
const SupplierApply = React.lazy(() => import('./features/marketplace/ApplyPage'));
const MarketPaymentReturn = React.lazy(() => import('./features/marketplace/salon/PaymentReturn'));
const lazy = (el: React.ReactNode) => <React.Suspense fallback={null}>{el}</React.Suspense>;

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
        {/* Target of the staff invitation e-mail */}
        <Route path="invitation/:token" element={<InvitationPage />} />
        {/* Supplier marketplace: public "Devenir fournisseur" signup */}
        <Route path="devenir-fournisseur" element={lazy(<SupplierApply />)} />

        {/* Authentication routes */}
        <Route path="auth" element={<PublicOnlyGuard />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Route>

        {/* Protected routes */}
        <Route element={<AuthGuard />}>
          {/* Supplier space (own layout) */}
          <Route path="fournisseur/*" element={lazy(<SupplierSpace />)} />
          <Route element={<MainLayout />}>
            {/* Owner pages: a staff login is sent to "Mon planning" (the API refuses their calls anyway) */}
            <Route path="dashboard" element={<OwnerOnly><DashboardPage /></OwnerOnly>} />
            <Route path="clients" element={<Allowed perm="viewClients"><ClientsPage /></Allowed>} />
            <Route path="services" element={<Allowed perm="manageServices"><ServicesPage /></Allowed>} />
            <Route path="appointments" element={<OwnerOnly><AppointmentsPage /></OwnerOnly>} />
            <Route path="appointments/history" element={<OwnerOnly><AppointmentHistoryPage /></OwnerOnly>} />
            <Route path="team" element={<OwnerOnly><TeamPage /></OwnerOnly>} />
            <Route path="team/:id/file" element={<OwnerOnly><EmployeeFilePage /></OwnerOnly>} />
            <Route path="products" element={<Allowed perm="manageProducts"><ProductsPage /></Allowed>} />
            <Route path="interface" element={<OwnerOnly><InterfacePage /></OwnerOnly>} />
            <Route path="profile" element={<OwnerOnly><ProfilePage /></OwnerOnly>} />
            <Route path="subscription" element={<OwnerOnly><SubscriptionPage /></OwnerOnly>} />
            <Route path="admin" element={<OwnerOnly><AdminPage /></OwnerOnly>} />
            {/* SATIM sends the salon back here after paying a supplier order */}
            <Route path="marketplace/payment-return" element={<OwnerOnly>{lazy(<MarketPaymentReturn />) as React.ReactElement}</OwnerOnly>} />
            {/* Staff space */}
            <Route path="my-planning" element={<StaffOnly><MyPlanningPage /></StaffOnly>} />
            <Route path="my-leaves" element={<StaffOnly><MyLeavesPage /></StaffOnly>} />
            <Route path="my-profile" element={<StaffOnly><MyProfilePage /></StaffOnly>} />
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
