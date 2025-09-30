import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/utils/supabase';
import { FcGoogle } from 'react-icons/fc';
import JobAiroLogo from '@/components/Icons/JobAiroLogo';

// Job types options
const JOB_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Freelance',
  'Internship',
  'Remote',
  'Hybrid',
  'On-site'
];

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
  const [jobPreferences, setJobPreferences] = useState({
    desired_salary_min: '',
    desired_salary_max: '',
    job_types: [] as string[],
    preferred_locations: [] as string[],
  });

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

  const toggleJobType = (jobType: string) => {
    setJobPreferences(prev => ({
      ...prev,
      job_types: prev.job_types.includes(jobType)
        ? prev.job_types.filter(type => type !== jobType)
        : [...prev.job_types, jobType]
    }));
  };

  const saveJobPreferences = async (userId: string) => {
    try {
      console.log('saveJobPreferences called with userId:', userId);
      console.log('Current jobPreferences state:', jobPreferences);

      const preferencesData = {
        desired_salary_min: jobPreferences.desired_salary_min ? parseInt(jobPreferences.desired_salary_min) : undefined,
        desired_salary_max: jobPreferences.desired_salary_max ? parseInt(jobPreferences.desired_salary_max) : undefined,
        job_types: jobPreferences.job_types,
        preferred_locations: jobPreferences.preferred_locations,
      };

      console.log('Formatted preferences data:', preferencesData);

      // Use upsert to handle both insert and update cases
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: userId,
          job_preferences: preferencesData,
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Failed to save job preferences:', error);
      } else {
        console.log('Job preferences saved successfully via upsert');
      }
    } catch (error) {
      console.error('Error saving job preferences:', error);
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
        // Sign up with job preferences in user metadata
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              // Store job preferences in user metadata temporarily
              pending_job_preferences: {
                desired_salary_min: jobPreferences.desired_salary_min ? parseInt(jobPreferences.desired_salary_min) : undefined,
                desired_salary_max: jobPreferences.desired_salary_max ? parseInt(jobPreferences.desired_salary_max) : undefined,
                job_types: jobPreferences.job_types,
                preferred_locations: jobPreferences.preferred_locations,
              }
            }
          },
        });
        if (error) throw error;

        console.log('Job preferences stored in user metadata for email confirmation');

        // If user is created immediately (without email confirmation), save job preferences
        if (data.user && data.user.email_confirmed_at) {
          console.log('User confirmed immediately, saving job preferences...');
          // User is confirmed immediately, save job preferences
          await saveJobPreferences(data.user.id);
          const redirectUrl = sessionStorage.getItem('auth_redirect_url') || '/';
          sessionStorage.removeItem('auth_redirect_url');
          router.push(redirectUrl);
        } else {
          console.log('Email confirmation required - job preferences stored in user metadata');
          setSuccess('Check your email for a verification link!');

          // Clear the form after successful signup
          setEmail('');
          setPassword('');
          setConfirmPassword('');
          setJobPreferences({
            desired_salary_min: '',
            desired_salary_max: '',
            job_types: [],
            preferred_locations: [],
          });
          setAcceptTerms(false);
        }
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
        <div className="hidden lg:block lg:fixed lg:inset-y-0 lg:left-0 lg:w-1/2 bg-gradient-to-br from-[#10b981] to-[#047857] text-white flex-col justify-center items-center p-12">
          <div className="max-w-md text-center">
            <div className="mb-8 flex justify-center">
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
        <div className="w-full lg:w-1/2 lg:ml-[50%] flex flex-col p-8 bg-gray-50 dark:bg-dark-20 min-h-screen overflow-y-auto overflow-x-hidden">
          <div className="max-w-md w-full mx-auto py-8">
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
                  className="mt-1 w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#10b981] focus:border-[#10b981] dark:bg-dark-25 dark:border-gray-600 dark:text-white"
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

            <div className="mt-10 text-center">
              <button
                onClick={() => setShowForgotPassword(false)}
                className="text-[#10b981] hover:text-[#047857] dark:text-[#10b981] font-medium"
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
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Left Side - Branding - Fixed */}
      <div className="hidden lg:block lg:fixed lg:inset-y-0 lg:left-0 lg:w-1/2 bg-gradient-to-br from-[#10b981] to-[#047857] text-white flex flex-col justify-center items-center p-12">
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
      <div className="w-full lg:w-1/2 lg:ml-[50%] flex flex-col p-8 bg-white dark:bg-dark-20 min-h-screen overflow-y-auto overflow-x-hidden">
        <div className="max-w-md w-full mx-auto py-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <JobAiroLogo />
          </div>

          {/* Page Heading - Moved to top */}
          <div className="text-center mb-8">
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
                className="text-[#10b981] hover:text-[#047857] dark:text-[#10b981] font-medium"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          <div className="space-y-6">

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
            className="w-full flex items-center justify-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#10b981] disabled:opacity-50 disabled:cursor-not-allowed dark:bg-dark-25 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700"
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
                className="mt-1 w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#10b981] focus:border-[#10b981] dark:bg-dark-25 dark:border-gray-600 dark:text-white"
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
                className="mt-1 w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#10b981] focus:border-[#10b981] dark:bg-dark-25 dark:border-gray-600 dark:text-white"
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
                  className="mt-1 w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#10b981] focus:border-[#10b981] dark:bg-dark-25 dark:border-gray-600 dark:text-white"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            )}

            {!isLogin && (
              <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Job Preferences (Optional)</h4>

                {/* Salary Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Desired Salary Range ($)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      value={jobPreferences.desired_salary_min}
                      onChange={(e) => setJobPreferences(prev => ({ ...prev, desired_salary_min: e.target.value }))}
                      placeholder="Min"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-[#10b981] focus:border-[#10b981] dark:bg-dark-25 dark:border-gray-600 dark:text-white"
                    />
                    <input
                      type="number"
                      value={jobPreferences.desired_salary_max}
                      onChange={(e) => setJobPreferences(prev => ({ ...prev, desired_salary_max: e.target.value }))}
                      placeholder="Max"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-[#10b981] focus:border-[#10b981] dark:bg-dark-25 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>

                {/* Job Types */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preferred Job Types
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {JOB_TYPES.map((jobType) => (
                      <button
                        key={jobType}
                        type="button"
                        onClick={() => toggleJobType(jobType)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          jobPreferences.job_types.includes(jobType)
                            ? 'bg-[#10b981] text-white hover:bg-[#047857]'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {jobType}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preferred Locations */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preferred Locations
                  </label>
                  <input
                    type="text"
                    value={jobPreferences.preferred_locations.join(', ')}
                    onChange={(e) => {
                      const locations = e.target.value.split(',').map(loc => loc.trim()).filter(loc => loc);
                      setJobPreferences(prev => ({ ...prev, preferred_locations: locations }));
                    }}
                    placeholder="e.g., New York, Remote, San Francisco"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-[#10b981] focus:border-[#10b981] dark:bg-dark-25 dark:border-gray-600 dark:text-white"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Separate multiple locations with commas
                  </p>
                </div>
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
                    className="h-4 w-4 text-[#10b981] focus:ring-[#10b981] border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-white">
                    Remember me
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-[#10b981] hover:text-[#047857] dark:text-[#10b981]"
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
                  className="h-4 w-4 text-[#10b981] focus:ring-[#10b981] border-gray-300 rounded"
                  required
                />
                <label htmlFor="accept-terms" className="ml-2 block text-sm text-gray-900 dark:text-white">
                  I accept the{' '}
                  <a href="/terms" className="text-[#10b981] hover:text-[#047857] dark:text-[#10b981]">
                    Terms and Conditions
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-[#10b981] hover:text-[#047857] dark:text-[#10b981]">
                    Privacy Policy
                  </a>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#10b981] hover:bg-[#047857] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#10b981] disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
};

export default AuthPage;


