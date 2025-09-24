import * as React from 'react';

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'>
>(({ className, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={`w-full rounded-md border border-themeGray-10 bg-white px-2.5 py-3 font-poppins text-base font-semibold outline-none transition-colors hover:bg-themeGray-10 hover:text-white ${
        className || ''
      } `}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export { Button };
