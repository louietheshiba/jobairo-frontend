import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/utils/supabase';
import { FcGoogle } from 'react-icons/fc';
import JobAiroLogo from '@/components/Icons/JobAiroLogo';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  const router = useRouter();
  const { user } = useAuth();

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      const redirectUrl = sessionStorage.getItem('auth_redirect_url') || '/';
      sessionStorage.removeItem('auth_redirect_url');
      router.push(redirectUrl);
    }
  }, [user, router]);

  const handleGoogleAuth = async () => {
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

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!isLogin && !acceptTerms) {
      setError('Please accept the terms and conditions');
      return;
    }

    try {
      setLoading(true);
      setError('');

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        const redirectUrl = sessionStorage.getItem('auth_redirect_url') || '/';
        sessionStorage.removeItem('auth_redirect_url');
        router.push(redirectUrl);
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        
        setSuccess('Check your email for a verification link!');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;
      
      setSuccess('Password reset email sent! Check your inbox.');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br  from-[#319795] to-[#246463] text-white flex-col justify-center items-center p-12">
          <div className="max-w-md text-center">
            <div className="mb-8">
              <JobAiroLogo />
            </div>
            <h1 className="text-4xl font-bold mb-4">Welcome Back to JobAiro</h1>
            <p className="text-xl opacity-90">
              Reset your password to continue your job search journey
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">50K+</div>
                <div className="text-sm opacity-75">Active Jobs</div>
              </div>
              <div>
                <div className="text-2xl font-bold">10K+</div>
                <div className="text-sm opacity-75">Companies</div>
              </div>
              <div>
                <div className="text-2xl font-bold">1M+</div>
                <div className="text-sm opacity-75">Job Seekers</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Reset Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Reset Password
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Enter your email to receive a reset link
              </p>
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/50 dark:border-red-800">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md dark:bg-green-900/50 dark:border-green-800">
                {success}
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#319795] focus:border-[#319795] dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#319795] hover:bg-[#246463] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#319795] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <div className="text-center">
              <button
                onClick={() => setShowForgotPassword(false)}
                className="text-[#319795] hover:text-[#246463] dark:text-[#319795] font-medium"
              >
                ← Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#319795] to-[#246463] text-white flex-col justify-center items-center p-12">
        <div className="max-w-md text-center">
          <div className="mb-8 mx-auto flex justify-center">
            <JobAiroLogo />
          </div>
          <h1 className="text-4xl font-bold mb-4">
            {isLogin ? 'Welcome Back to JobAiro' : 'Join JobAiro Today'}
          </h1>
          <p className="text-xl opacity-90">
            {isLogin 
              ? 'Continue your job search journey with us' 
              : 'Start your career journey with thousands of opportunities'
            }
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">50K+</div>
              <div className="text-sm opacity-75">Active Jobs</div>
            </div>
            <div>
              <div className="text-2xl font-bold">10K+</div>
              <div className="text-sm opacity-75">Companies</div>
            </div>
            <div>
              <div className="text-2xl font-bold">1M+</div>
              <div className="text-sm opacity-75">Job Seekers</div>
            </div>
          </div>
          
          {/* Testimonial */}
          <div className="mt-12 p-6 bg-white/10 rounded-lg backdrop-blur-sm">
            <p className="text-sm italic mb-3">
              "JobAiro helped me find my dream job in just 2 weeks. The platform is incredibly user-friendly!"
            </p>
            <p className="text-xs font-medium">- Sarah Chen, Software Engineer</p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-gray-900">
        <div className="max-w-md w-full space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8  ">
            <JobAiroLogo />
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {isLogin ? 'Sign in to your account' : 'Create your account'}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {isLogin 
                ? "Don't have an account? " 
                : "Already have an account? "
              }
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setSuccess('');
                }}
                className="text-[#319795] hover:text-[#246463] dark:text-[#319795] font-medium"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/50 dark:border-red-800">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md dark:bg-green-900/50 dark:border-green-800">
              {success}
            </div>
          )}

          {/* Google Auth Button */}
          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#319795] disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700"
          >
            <FcGoogle size={20} />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center">
            <div className="flex-1 border-t border-gray-300 dark:border-gray-600" />
            <div className="mx-4 text-sm text-gray-500 dark:text-gray-400">OR</div>
            <div className="flex-1 border-t border-gray-300 dark:border-gray-600" />
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#319710] focus:border-[#319710] dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#319795] focus:border-[#319795] dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                placeholder={isLogin ? "Enter your password" : "Create a password"}
                required
                minLength={6}
              />
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#319795] focus:border-[#319795] dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            )}

            {isLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-[#319795] focus:ring-[#319795] border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-white">
                    Remember me
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-[#319795] hover:text-[#246463] dark:text-[#319795]"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {!isLogin && (
              <div className="flex items-center">
                <input
                  id="accept-terms"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="h-4 w-4 text-[#319795] focus:ring-[#319710] border-gray-300 rounded"
                  required
                />
                <label htmlFor="accept-terms" className="ml-2 block text-sm text-gray-900 dark:text-white">
                  I accept the{' '}
                  <a href="/terms" className="text-[#319795] hover:text-[#246463] dark:text-[#319795]">
                    Terms and Conditions
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-[#319795] hover:text-[#246463] dark:text-[#319795]">
                    Privacy Policy
                  </a>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#319795] hover:bg-[#246463] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#319795] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading 
                ? (isLogin ? 'Signing in...' : 'Creating account...') 
                : (isLogin ? 'Sign in' : 'Create account')
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;