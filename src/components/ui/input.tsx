import * as React from 'react';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={`w-full rounded-md border border-themeGray-10 bg-white px-2.5 py-3 font-poppins text-base font-semibold outline-none placeholder:text-themeGray-10 dark:border-dark-15 dark:bg-dark-25 dark:text-white ${
          className || ''
        }`}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
