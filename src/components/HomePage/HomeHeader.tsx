import React from 'react';
import JobAiroLogo from '../Icons/JobAiroLogo';
import Switcher from '../Switcher';
import UserMenu from '../UserMenu';

const HomeHeader = () => {
  return (
    <header className="w-full px-4 py-3 sm:px-6 lg:px-8 bg-white dark:bg-dark-25 shadow-sm">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left Section (empty or future nav) */}
        <div className="hidden sm:block w-1/3"></div>

        {/* Center Section (Logo + Text) */}
        <div className="flex flex-col items-center text-center">
          <span className="text-black dark:text-white">
            <JobAiroLogo />
          </span>
          <p className="text-xs sm:text-sm font-poppins font-medium text-gray-700 dark:text-gray-300 uppercase">
            A Simplistic Job Search Engine
          </p>
        </div>

        {/* Right Section (User + Switcher) */}
        <div className="flex items-center justify-center sm:justify-end gap-3 sm:gap-4 w-full sm:w-1/3">
          <UserMenu />
          <Switcher />
        </div>
      </div>
    </header>
  );
};

export default HomeHeader;
