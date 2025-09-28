import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/utils/supabase';
import JobAiroLogo from '@/components/Icons/JobAiroLogo';

const ResetPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Check if we have the required hash parameters for password reset
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
            // Set the session with the tokens from the URL
            supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
            });
        }
    }, []);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            setSuccess(true);

            // Redirect to login after a short delay
            setTimeout(() => {
                router.push('/auth');
            }, 2000);

        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex">
                {/* Left Side - Branding */}
                <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#319795] to-[#246463] text-white flex-col justify-center items-center p-12">
                    <div className="max-w-md text-center">
                        <div className="mb-8 mx-auto flex justify-center">
                            <JobAiroLogo />
                        </div>
                        <h1 className="text-4xl font-bold mb-4">Password Updated!</h1>
                        <p className="text-xl opacity-90">
                            Your password has been successfully reset. You can now sign in with your new password.
                        </p>

                    </div>
                </div>

                {/* Right Side - Success Message */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
                    <div className="max-w-md w-full space-y-8">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
                                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
                                Password Reset Successful
                            </h2>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Redirecting you to the login page...
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>

            <div className="min-h-screen flex">
                {/* Left Side - Branding */}
                <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#319795] to-[#246463] text-white flex-col justify-center items-center p-12">
                    <div className="max-w-md text-center">
                        <div className="mb-8 mx-auto flex justify-center">
                            <JobAiroLogo />
                        </div>
                        <h1 className="text-4xl font-bold mb-4">
                            'Welcome Back to JobAiro'
                        </h1>
                        <p className="text-xl opacity-90">
                            Continue your job search journey with us
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

                {/* Right Side - Reset Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
                    <div className="max-w-md w-full space-y-8">
                        {/* Mobile Logo */}
                        <div className="lg:hidden text-center mb-8">
                            <JobAiroLogo />
                        </div>

                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Set New Password
                            </h2>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Enter your new password below
                            </p>
                        </div>

                        {error && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/50 dark:border-red-800">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    New Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="mt-1 w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#319795] focus:border-[#319795] dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                    placeholder="Enter new password"
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Confirm New Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="mt-1 w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#319795] focus:border-[#319795] dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                    placeholder="Confirm new password"
                                    required
                                    minLength={6}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#319795] hover:bg-[#246463] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#319795] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Updating Password...' : 'Update Password'}
                            </button>
                        </form>

                        <div className="text-center">
                            <button
                                onClick={() => router.push('/auth')}
                                className="text-[#319795] hover:text-[#246463] dark:text-[#319795] font-medium"
                            >
                                ← Back to Login
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ResetPasswordPage;
