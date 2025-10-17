import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './i18n';
import { useInterfaceStore } from './features/interface/store';
import { useThemeColors } from './hooks/useThemeColors';
import { useTemplateLoader } from './hooks/useTemplateLoader';
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
import { SubscriptionPage } from './features/subscription/SubscriptionPage';
import { Toast } from './components/Toast';
import { LoginPage } from './features/auth/pages/LoginPage';
import { RegisterPage } from './features/auth/pages/RegisterPage';
import { AuthGuard, PublicOnlyGuard } from './features/auth/components/AuthGuard';
import ErrorBoundary from './components/ErrorBoundary';
import LandingPage from './features/marketing/pages/LandingPage';
import LandingPageStatic from './features/marketing/pages/LandingPageStatic';
import LandingPagePro from './features/marketing/pages/LandingPagePro';
import PricingPage from './features/marketing/pages/PricingPage';

export const App: React.FC = () => {
  const { t } = useTranslation('common');
  const checkImages = useInterfaceStore((state) => state.checkImages);
  
  // Apply theme colors
  useThemeColors();
  
  // Restore saved template
  useTemplateLoader();

  useEffect(() => {
    checkImages();
  }, [checkImages]);

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
        {/* Protected routes */}
        <Route element={<AuthGuard />}>
          <Route element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
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
          </Route>
        </Route>

        {/* Authentication routes */}
        <Route path="auth" element={<PublicOnlyGuard />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Route>

        {/* Public routes */}
        <Route path="salon/:slug" element={<SalonPage />} />
        <Route path="salon/:slug/appointments/list" element={<PublicAppointmentList />} />
        <Route path="appointment/:token" element={<PublicAppointmentManager />} />
        <Route path="appointments/list" element={<PublicAppointmentList />} />
        
        {/* Marketing routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/landing-static" element={<LandingPageStatic />} />
        <Route path="/landing-pro" element={<LandingPagePro />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/login" element={<Navigate to="/auth/login" replace />} />
        <Route path="/register" element={<Navigate to="/auth/register" replace />} />

        {/* Default redirection */}
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toast />
      </Router>
    </ErrorBoundary>
  );
};

export default App;
