'use client';

import { useState } from 'react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Car, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { LoginCredentials } from '@/types/auth';

interface LoginViewProps {
  onLogin: () => void;
  onForgotPassword: () => void;
}

export function LoginView({ onLogin, onForgotPassword }: LoginViewProps) {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(credentials);

      if (success) {
        toast.success('Login successful!');
        onLogin();
      } else {
        setError('Invalid username, email or password');
        toast.error('Login failed');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred. Please try again.';
      setError(errorMessage);
      toast.error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof LoginCredentials) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCredentials(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 mb-4">
            <Car className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Driving School Manager</h1>
          <p className="text-gray-600">Sign in to access the management system</p>
        </div>

        <Card className="p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={credentials.username}
                onChange={handleInputChange('username')}
                required
                autoFocus
                disabled={isLoading}
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={credentials.email}
                onChange={handleInputChange('email')}
                required
                disabled={isLoading}
              />
            </div>

            {/* Password Field with Toggle */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline disabled:text-gray-400"
                  disabled={isLoading}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={handleInputChange('password')}
                  required
                  className="pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none disabled:opacity-50"
                  disabled={isLoading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
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

          {/* <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600 space-y-2">
              <p className="font-medium">Demo Credentials:</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium w-20">Username:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">Admin</code>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium w-20">Email:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">admin@drivingschool.com</code>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium w-20">Password:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">admin123</code>
                </div>
              </div>
            </div>
          </div> */}
        </Card>

        <p className="text-center text-sm text-gray-500 mt-6">
          Driving School Management System © 2025
        </p>
      </div>
    </div>
  );
}