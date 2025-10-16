import React from 'react';

import DarkModeIcon from '../Icons/DarkModeIcon';

const Switcher = () => {
  // Simple theme toggle without context dependency for SSR compatibility
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  React.useEffect(() => {
    const storedPreference = localStorage.getItem('jobario_theme');
    setIsDarkMode(storedPreference === 'dark');
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newValue = !prev;
      localStorage.setItem('jobario_theme', newValue ? 'dark' : 'light');
      if (newValue) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return newValue;
    });
  };

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
