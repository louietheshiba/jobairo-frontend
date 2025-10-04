import React, { useState } from 'react';
import { supabase } from '@/utils/supabase';
import { FcGoogle } from 'react-icons/fc';

interface LoginFormProps {
  onSuccess: () => void;
  onSwitchToSignup: () => void;
  onForgotPassword: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToSignup, onForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      onSuccess();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Sign in to your account to continue
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/50 dark:border-red-800">
          {error}
        </div>
      )}

      {/* Google Login Button */}
      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#10b981] disabled:opacity-50 disabled:cursor-not-allowed dark:bg-dark-25 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700"
      >
        <FcGoogle size={20} />
        Continue with Google
      </button>

      {/* Divider */}
      <div className="my-6 flex items-center">
        <div className="flex-1 border-t border-gray-300 dark:border-gray-600" />
        <div className="mx-4 text-sm text-gray-500 dark:text-gray-400">OR</div>
        <div className="flex-1 border-t border-gray-300 dark:border-gray-600" />
      </div>

      {/* Email/Password Form */}
      <form onSubmit={handleEmailLogin} className="space-y-4">
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

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#10b981] focus:border-[#10b981] dark:bg-dark-25 dark:border-gray-600 dark:text-white"
            placeholder="Enter your password"
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-[#10b981] focus:ring-[#10b981] border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-white">
              Remember me
            </label>
          </div>

          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-[#10b981] hover:text-[#047857] dark:text-white"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#10b981] hover:bg-[#047857] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#10b981] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToSignup}
            className="text-[#10b981] hover:text-[#047857] dark:text-blue-400 font-medium"
          >
            Sign up
          </button>
        </span>
      </div>
    </div>
  );
};

export default LoginForm;