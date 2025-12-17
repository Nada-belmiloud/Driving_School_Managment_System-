'use client';

import { useState } from 'react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Mail, Lock, User, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export function SettingsView() {
  const { user } = useAuth();

  const [emailForm, setEmailForm] = useState({
    currentEmail: user?.email || 'admin@drivingschool.com',
    newEmail: '',
    confirmEmail: '',
    password: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  const [nameForm, setNameForm] = useState({
    newName: ''
  });

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (emailForm.newEmail !== emailForm.confirmEmail) {
      toast.error('New email addresses do not match');
      return;
    }

    if (!emailForm.password) {
      toast.error('Please enter your current password to confirm');
      return;
    }

    setIsLoading(true);
    try {
      const result = await authApi.updateEmail(emailForm.newEmail, emailForm.password);
      if (result.success) {
        toast.success('Email updated successfully!');
        setEmailForm({
          currentEmail: emailForm.newEmail,
          newEmail: '',
          confirmEmail: '',
          password: ''
        });
      } else {
        toast.error(result.error || 'Failed to update email');
      }
    } catch (error) {
      toast.error('Failed to update email');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const result = await authApi.updatePassword(passwordForm.currentPassword, passwordForm.newPassword);
      if (result.success) {
        toast.success('Password updated successfully!');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        toast.error(result.error || 'Failed to update password');
      }
    } catch (error) {
      toast.error('Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();

    // Simulate API call
    toast.success('Profile updated successfully!');
  };

  const handleNameUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nameForm.newName.trim()) {
      toast.error('Please enter a new username');
      return;
    }

    if (nameForm.newName.trim().length < 2) {
      toast.error('Username must be at least 2 characters');
      return;
    }

    setIsLoading(true);
    try {
      const result = await authApi.updateName(nameForm.newName);
      if (result.success) {
        toast.success('Username updated successfully!');
        setNameForm({ newName: '' });
        // You might want to refresh user data here
      } else {
        toast.error(result.error || 'Failed to update username');
      }
    } catch (error) {
      toast.error('Failed to update username');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-gray-900">Account Settings</h1>
        <p className="text-gray-600">Manage your account information and security</p>
      </div>

      <div className="max-w-5xl space-y-6 transform translate-x-20">
        {/* Email Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-gray-900">Email Address</div>
              <p className="text-sm text-gray-600">Change your email address</p>
            </div>
          </div>

          <form onSubmit={handleEmailUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentEmail">Current Email</Label>
              <Input
                id="currentEmail"
                type="email"
                value={emailForm.currentEmail}
                disabled
                className="bg-gray-50"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="newEmail">New Email Address</Label>
              <Input
                id="newEmail"
                type="email"
                placeholder="Enter new email"
                value={emailForm.newEmail}
                onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmEmail">Confirm New Email</Label>
              <Input
                id="confirmEmail"
                type="email"
                placeholder="Confirm new email"
                value={emailForm.confirmEmail}
                onChange={(e) => setEmailForm({ ...emailForm, confirmEmail: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emailPassword">Current Password (to confirm)</Label>
              <Input
                id="emailPassword"
                type="password"
                placeholder="Enter your current password"
                value={emailForm.password}
                onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                required
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Email'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Name Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-gray-900">Username</div>
              <p className="text-sm text-gray-600">Change your display name (username)</p>
            </div>
          </div>

          <form onSubmit={handleNameUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentName">Current Username</Label>
              <Input
                id="currentName"
                type="text"
                value={user?.name || ''}
                disabled
                className="bg-gray-50"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="newName">New Username</Label>
              <Input
                id="newName"
                type="text"
                placeholder="Enter new username"
                value={nameForm.newName}
                onChange={(e) => setNameForm({ ...nameForm, newName: e.target.value })}
                required
                minLength={2}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Username'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Password Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Lock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-gray-900">Password</div>
              <p className="text-sm text-gray-600">Change your password</p>
            </div>
          </div>

          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="Enter current password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                required
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password (min. 6 characters)"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                required
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Security Notice */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-blue-900 mb-1">Security Recommendations</div>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Use a strong password with at least 8 characters</li>
                <li>• Include uppercase, lowercase, numbers, and special characters</li>
                <li>• Don't share your password with anyone</li>
                <li>• Change your password regularly</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
