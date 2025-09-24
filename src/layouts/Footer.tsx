import React from 'react';

const Footer = () => {
  return (
    <footer className="flex h-[50px] items-center justify-center border-t border-themeGray-10 bg-white dark:border-dark-15 dark:bg-dark-25">
      <p className="text-center font-poppins text-base font-normal text-black dark:text-white">
        Copyright © 2025{' '}
        <span className="font-bold text-primary-10">JobAiro</span>
      </p>
    </footer>
  );
};

export default Footer;
