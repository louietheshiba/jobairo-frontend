import React from 'react';
import JobAiroLogo from '../Icons/JobAiroLogo';
import Switcher from '../Switcher';
import UserMenu from '../UserMenu';

const HomeHeader = () => {
  return (
    <div className="grid w-full grid-cols-3 items-center px-4 py-6 sm:px-6 lg:px-8">
      {/* Spacer for left side */}
      <div></div>

      {/* Centered Logo and Title (Original Design) */}
      <div className="flex flex-col items-center gap-2.5">
        <span className="text-black dark:text-white">
          <JobAiroLogo />
        </span>
        <p className="text-center font-poppins text-sm font-medium text-gray-700 dark:text-gray-300 sm:text-base uppercase">
          A Simplistic Job Search Engine
        </p>
      </div>

      {/* User Menu and Theme Switcher (Right Side) */}
      <div className="flex items-center justify-end gap-4">
        <UserMenu />
        <Switcher />
      </div>
    </div>
  );
};

export default HomeHeader;


