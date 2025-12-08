'use client';

import { useState } from 'react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Car, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface LoginViewProps {
  onLogin: () => void;
  onForgotPassword: () => void;
}

export function LoginView({ onLogin, onForgotPassword }: LoginViewProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate a small delay for authentication
    setTimeout(() => {
      // Simple authentication - in a real app, this would be server-side
      if (username === 'manager' && password === 'admin123') {
        toast.success('Login successful!');
        onLogin();
      } else {
        setError('Invalid username or password');
        toast.error('Login failed');
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 mb-4">
            <Car className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-gray-900 mb-2">Driving School Manager</h1>
          <p className="text-gray-600">Sign in to access the management system</p>
        </div>

        <Card className="p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">Demo Credentials:</span></p>
              <p>Username: <code className="bg-gray-100 px-2 py-0.5 rounded">manager</code></p>
              <p>Password: <code className="bg-gray-100 px-2 py-0.5 rounded">admin123</code></p>
            </div>
          </div>
        </Card>

        <p className="text-center text-sm text-gray-500 mt-6">
          Driving School Management System © 2025
        </p>
      </div>
    </div>
  );
}
