import React, { useState } from 'react';
import { supabase } from '@/utils/supabase';

interface ForgotPasswordFormProps {
  onSuccess: () => void;
  onBackToLogin: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onSuccess, onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;
      
      setSuccess(true);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-6 text-center">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Check Your Email</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            We've sent a password reset link to {email}
          </p>
        </div>
        
        <div className="mb-6 p-4 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md dark:bg-green-900/50 dark:border-green-800">
          Password reset email sent successfully! Check your inbox and follow the instructions to reset your password.
        </div>

        <button
          onClick={onSuccess}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#10b981] hover:bg-[#047857] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#10b981]"
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reset Password</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Enter your email address and we'll send you a link to reset your password
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/50 dark:border-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleResetPassword} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#10b981] focus:border-[#10b981] dark:bg-dark-25 dark:border-gray-600 dark:text-white"
            placeholder="Enter your email"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#10b981] hover:bg-[#047857] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#10b981] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <div className="mt-32 text-center">
        <button
          onClick={onBackToLogin}
          className="text-[#10b981] hover:text-[#047857] mt-10 dark:text-[#10b981] font-medium text-sm"
        >
          ← Back to Login
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;