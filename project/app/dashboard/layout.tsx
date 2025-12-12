'use client';

import { Sidebar } from '@/components/utils/Sidebar';
import { usePathname, useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  
  const getActiveView = () => {
    const segments = pathname.split('/');
    return segments[2] || 'dashboard';
  };

  const handleViewChange = (view: string) => {
    if (view === 'dashboard') {
      router.push('/dashboard');
    } else {
      router.push(`/dashboard/${view}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('drivingSchoolAuth');
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        activeView={getActiveView()} 
        onViewChange={handleViewChange}
        onLogout={handleLogout}
      />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}