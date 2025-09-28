import React from 'react';
import Link from 'next/link';
import JobAiroLogo from '../Icons/JobAiroLogo';
import Switcher from '../Switcher';
import UserMenu from '../UserMenu';

const HomeHeader = () => {
  return (
    <header className="pt-10">
      <div className="relative flex w-full items-center px-4 sm:px-6 lg:px-8">
        {/* Centered Logo and Title (Original Design) */}
        <div className="absolute left-1/2 flex -translate-x-1/2 flex-col items-center gap-2.5">
          <span className="text-black dark:text-white">
            <JobAiroLogo />
          </span>
          <p className="text-center font-poppins text-sm font-medium text-gray-700 dark:text-gray-300 sm:text-base uppercase">
            A Simplistic Job Search Engine
          </p>
        </div>

        {/* User Menu and Theme Switcher (Right Side) */}
        <div className="ml-auto flex items-center gap-4">
          <UserMenu />
          <Switcher />
        </div>
      </div>
    </header>
  );
};

export default HomeHeader;

