import React from 'react';
import { AuthLayout } from '../components/AuthLayout';
import { RegisterForm } from '../components/RegisterForm';

export const RegisterPage: React.FC = () => (
  <AuthLayout title="register.title">
    <RegisterForm />
  </AuthLayout>
);
