import React, { useState } from 'react';
import { supabase } from '@/utils/supabase';
import { FcGoogle } from 'react-icons/fc';

interface SignupFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleGoogleSignup = async () => {
    try {
      setLoading(true);
      setError('');
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/login/callback`
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!acceptTerms) {
      setError('Please accept the terms and conditions');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      setSuccess('Check your email for a verification link!');
      onSuccess();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-6 text-center">
        <div className="mb-4 p-4 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md dark:bg-green-900/50 dark:border-green-800">
          {success}
        </div>
        <button
          onClick={onSwitchToLogin}
          className="text-[#00d4aa] hover:text-[#00b894] dark:text-white font-medium"
        >
          Return to login
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Account</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Join JobAiro to save and track your job applications
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/50 dark:border-red-800">
          {error}
        </div>
      )}

      {/* Google Signup Button */}
      <button
        onClick={handleGoogleSignup}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00d4aa] disabled:opacity-50 disabled:cursor-not-allowed dark:bg-dark-25 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700"
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
      <form onSubmit={handleEmailSignup} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#00d4aa] focus:border-[#10b981] dark:bg-dark-25 dark:border-gray-600 dark:text-white"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#00d4aa] focus:border-[#10b981] dark:bg-dark-25 dark:border-gray-600 dark:text-white"
            placeholder="Create a password"
            required
            minLength={6}
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#00d4aa] focus:border-[#10b981] dark:bg-dark-25 dark:border-gray-600 dark:text-white"
            placeholder="Confirm your password"
            required
          />
        </div>

        <div className="flex items-center">
          <input
            id="accept-terms"
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="h-4 w-4 text-[#10b981] focus:ring-[#00d4aa] border-gray-300 rounded"
            required
          />
          <label htmlFor="accept-terms" className="ml-2 block text-sm text-gray-900 dark:text-white">
            I accept the{' '}
            <a href="/terms" className="text-[#00d4aa] hover:text-[#00b894] dark:text-white">
              Terms and Conditions
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-[#00d4aa] hover:text-[#00b894] dark:text-white">
              Privacy Policy
            </a>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-[10px] shadow-[0_4px_15px_rgba(0,212,170,0.3)] text-sm font-medium text-white bg-gradient-to-r from-[#00d4aa] to-[#00b894] hover:shadow-[0_6px_20px_rgba(0,212,170,0.4)] hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00d4aa] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-[#00d4aa] hover:text-[#00b894] dark:text-white font-medium"
          >
            Sign in
          </button>
        </span>
      </div>
    </div>
  );
};

export default SignupForm;