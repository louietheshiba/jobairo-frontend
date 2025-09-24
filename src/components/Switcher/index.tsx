import React from 'react';

import { useTheme } from '@/context/useTheme';

import DarkModeIcon from '../Icons/DarkModeIcon';

const Switcher = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <button
      onClick={toggleDarkMode}
      className="flex items-center gap-1 font-poppins text-sm font-semibold text-primary-10 dark:text-white sm:gap-2 sm:text-base"
    >
      <span className="hidden sm:block ">
        <DarkModeIcon />
      </span>
      <span className="sm:hidden">
        <DarkModeIcon isSamll={true} />
      </span>
      {isDarkMode ? 'LIGHT' : 'DARK'}
    </button>
  );
};

export default Switcher;
