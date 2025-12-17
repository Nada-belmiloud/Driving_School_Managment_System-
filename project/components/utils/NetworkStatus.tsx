'use client';

import { useEffect, useState } from 'react';
import { WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';

export function NetworkStatus({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setIsRetrying(true);

    // Check if we're back online
    if (navigator.onLine) {
      setIsOnline(true);
      window.location.reload();
    } else {
      setTimeout(() => {
        setIsRetrying(false);
      }, 2000);
    }
  };

  if (!isOnline) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 mb-6 shadow-lg animate-pulse">
            <WifiOff className="w-12 h-12 text-white" />
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              No Internet Connection
            </h1>
            <p className="text-gray-600 mb-6">
              Driving School Manager requires an internet connection
            </p>

            {/* Warning Box */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span className="font-semibold text-amber-800">Connection Required</span>
              </div>
              <p className="text-sm text-amber-700">
                This application needs to connect to our cloud database to sync your driving school data.
              </p>
            </div>

            {/* Troubleshooting Steps */}
            <div className="text-left mb-6">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Troubleshooting Steps
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold flex-shrink-0">
                    1
                  </span>
                  <span className="text-sm text-gray-600">
                    Check if your Wi-Fi or ethernet cable is connected properly
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold flex-shrink-0">
                    2
                  </span>
                  <span className="text-sm text-gray-600">
                    Try restarting your router or modem
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold flex-shrink-0">
                    3
                  </span>
                  <span className="text-sm text-gray-600">
                    Disable any VPN or firewall that might be blocking the connection
                  </span>
                </div>
              </div>
            </div>

            {/* Retry Button */}
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-70"
            >
              <RefreshCw className={`w-5 h-5 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Checking...' : 'Retry Connection'}
            </button>

            {/* Status Indicator */}
            <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-red-50 rounded-full">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span className="text-sm text-red-600">Offline</span>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-6 text-sm text-gray-400">
            <span className="font-medium text-gray-500">Driving School Manager</span> • Cloud-based Management System
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

