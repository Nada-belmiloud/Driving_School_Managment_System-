'use client';

import { Dashboard } from '@/components/dashboard/Dashboard';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  const handleNavigate = (view: string) => {
    router.push(`/dashboard/${view}`);
  };

  return <Dashboard onNavigate={handleNavigate} />;
}