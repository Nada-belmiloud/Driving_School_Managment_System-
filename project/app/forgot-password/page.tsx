'use client';

import { ForgotPasswordView } from '@/components/auth/ForgotPasswordView';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const router = useRouter();

  const handleBackToLogin = () => {
    // Redirect back to login page
    router.push('/login');
  };

  return (
    <ForgotPasswordView 
      onBackToLogin={handleBackToLogin}
    />
  );
}