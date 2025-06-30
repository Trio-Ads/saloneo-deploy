import React from 'react';
import { AuthLayout } from '../components/AuthLayout';
import { LoginForm } from '../components/LoginForm';

export const LoginPage: React.FC = () => (
  <AuthLayout title="login.title">
    <LoginForm />
  </AuthLayout>
);
