'use client';

import { useState } from 'react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { GraduationCap, ArrowLeft, CheckCircle2, Loader2, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface ForgotPasswordViewProps {
  onBackToLogin: () => void;
}

export function ForgotPasswordView({ onBackToLogin }: ForgotPasswordViewProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await authApi.forgotPassword(email);

      if (result.success) {
        setEmailSent(true);
        // Check if reset URL was returned (email not configured)
        if (result.data?.resetUrl) {
          setResetUrl(result.data.resetUrl);
          toast.success('Password reset link generated!');
        } else {
          toast.success('Password reset instructions sent!');
        }
      } else {
        setEmailSent(true);
        toast.success('If an account exists, you will receive an email.');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setEmailSent(true);
      toast.success('If an account exists, you will receive an email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetClick = () => {
    if (resetUrl) {
      // Extract token from URL and navigate
      const url = new URL(resetUrl);
      const token = url.searchParams.get('token');
      if (token) {
        router.push(`/reset-password?token=${token}`);
      }
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-600 mb-4">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {resetUrl ? 'Reset Link Ready' : 'Check Your Email'}
            </h1>
            <p className="text-gray-600">
              {resetUrl
                ? 'Click the button below to reset your password'
                : "We've sent password reset instructions to your email"}
            </p>
          </div>

          <Card className="p-8 shadow-xl">
            <div className="text-center space-y-4">
              {resetUrl ? (
                <>
                  <p className="text-gray-700">
                    A password reset link has been generated for <span className="font-medium">{email}</span>.
                  </p>
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={handleResetClick}
                  >
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Reset My Password Now
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-gray-700">
                    If an account exists for <span className="font-medium">{email}</span>, you will receive an email with instructions to reset your password.
                  </p>
                  <p className="text-sm text-gray-600">
                    Didn't receive the email? Check your spam folder or try again.
                  </p>
                </>
              )}
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={onBackToLogin}
                variant={resetUrl ? "outline" : "default"}
              >
                Back to Login
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 mb-4">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h1>
          <p className="text-gray-600">Enter your email to receive reset instructions</p>
        </div>

        <Card className="p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Reset Instructions'
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={onBackToLogin}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-gray-500 mt-6">
          Driving School Management System © 2025
        </p>
      </div>
    </div>
  );
}
