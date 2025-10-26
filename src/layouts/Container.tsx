import React from 'react';
import { twMerge } from 'tailwind-merge';

interface IContainer {
  children: React.ReactNode;
  className?: string;
}

const Container: React.FC<IContainer> = ({ children, className = '' }) => {
  return (
    <div
      className={twMerge(
        'mx-auto  bg-white',
        className
      )}
    >
      {children}
    </div>
  );
};

export default Container;
