import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/context/AuthContext';
import { NetworkStatus } from '@/components/utils/NetworkStatus';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="h-full">
        <NetworkStatus>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </NetworkStatus>
      </body>
    </html>
  );
}