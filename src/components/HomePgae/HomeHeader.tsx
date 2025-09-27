import React from 'react';
import Link from 'next/link';
import JobAiroLogo from '../Icons/JobAiroLogo';
import Switcher from '../Switcher';
import UserMenu from '../UserMenu';

const HomeHeader = () => {
  return (
    <header className="flex w-full flex-col gap-5">
      <div className="relative flex w-full items-center">
        {/* Centered Logo & Tagline */}
        <div className="absolute left-1/2 flex -translate-x-1/2 flex-col items-center gap-2.5">
          <span className="text-black dark:text-white">
            <JobAiroLogo />
          </span>
          <p className="text-center font-poppins text-sm font-medium text-gray-700 dark:text-gray-300 sm:text-base uppercase">
            A Simplistic Job Search Engine
          </p>
        </div>

        {/* Right Side - Dashboard Link + User Menu + Dark Mode Switcher */}
        <div className="ml-auto flex items-center gap-4">
          <Link
            href="/dashboard"
            className="font-poppins text-sm font-semibold text-primary-10 dark:text-white hover:text-primary-15 dark:hover:text-primary-15 transition-colors"
          >
            Dashboard
          </Link>
          <UserMenu />
          <Switcher />
        </div>
      </div>
    </header>
  );
};

export default HomeHeader;
