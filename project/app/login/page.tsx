'use client';

import { LoginView } from '@/components/auth/LoginView';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = () => {
    // Redirect to dashboard after successful login
    router.push('/dashboard');
  };

  const handleForgotPassword = () => {
    // Redirect to forgot password page
    router.push('/forgot-password');
  };

  return (
    <LoginView 
      onLogin={handleLogin}
      onForgotPassword={handleForgotPassword}
    />
  );
}