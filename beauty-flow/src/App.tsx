import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useInterfaceStore } from './features/interface/store';
import { useThemeColors } from './hooks/useThemeColors';
import { useTemplateLoader } from './hooks/useTemplateLoader';
import MainLayout from './layouts/MainLayout';
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

export const App: React.FC = () => {
  const checkImages = useInterfaceStore((state) => state.checkImages);
  
  // Appliquer les couleurs du thème
  useThemeColors();
  
  // Restaurer le template sauvegardé
  useTemplateLoader();

  useEffect(() => {
    checkImages();
  }, [checkImages]);

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
        {/* Routes protégées */}
        <Route element={<AuthGuard />}>
          <Route element={<MainLayout />}>
            <Route path="dashboard" element={<AppointmentsPage />} />
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

        {/* Routes d'authentification */}
        <Route path="auth" element={<PublicOnlyGuard />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Route>

        {/* Routes publiques */}
        <Route path="salon/:slug" element={<SalonPage />} />
        <Route path="appointment/:token" element={<PublicAppointmentManager />} />
        <Route path="appointments/list" element={<PublicAppointmentList />} />

        {/* Redirection par défaut vers login */}
        <Route path="/" element={<Navigate to="/auth/login" replace />} />
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Routes>
        <Toast />
      </Router>
    </ErrorBoundary>
  );
};

export default App;
