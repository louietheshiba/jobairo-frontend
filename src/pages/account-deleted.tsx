import React from 'react';
import JobAiroLogo from '@/components/Icons/JobAiroLogo';

const AccountDeletedPage = () => {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Left Side - Branding - Fixed */}
      <div className="hidden lg:block lg:fixed lg:inset-y-0 lg:left-0 lg:w-1/2 bg-gradient-to-br from-[#10b981] to-[#047857] text-white flex flex-col justify-center items-center p-12">
        <div className="max-w-md text-center">
          <div className="mb-8 mx-auto flex justify-center">
            <JobAiroLogo />
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Thank You for Using JobAiro
          </h1>
          <p className="text-xl opacity-90">
            We appreciate your time with us and wish you the best in your future endeavors
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

      {/* Right Side - Message */}
      <div className="w-full lg:w-1/2 lg:ml-[50%] flex flex-col p-8 bg-white dark:bg-dark-20 min-h-screen overflow-y-auto overflow-x-hidden">
        <div className="max-w-md w-full mx-auto py-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <JobAiroLogo />
          </div>

          {/* Page Heading */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Account Deleted
            </h2>
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <div className="mb-6 p-4 bg-[#10b981]/10 dark:bg-[#10b981]/20 rounded-lg border border-[#10b981]/30">
                <p className="text-lg font-semibold text-[#10b981] dark:text-[#10b981]">
                  Your account was deleted. You're welcome back anytime.
                </p>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                We're sad to see you go. If you have any questions or suggestions, please email us at{' '}
                <a
                  href="mailto:support@jobairo.com"
                  className="text-[#10b981] hover:text-[#047857] dark:text-[#10b981] font-medium"
                >
                  support@jobairo.com
                </a>
                . We hope you'll come back to us one day.
              </p>
            </div>

            <div className="text-center pt-8">
              <a
                href="/"
                className="inline-flex justify-center py-3 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[#10b981] to-[#047857] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#10b981]"
              >
                Return to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDeletedPage;