import * as React from 'react';

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'>
>(({ className, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      
      className={`w-full rounded-[10px] bg-[#10b981] px-2.5 py-2 font-poppins text-base font-semibold text-white outline-none shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] hover:-translate-y-1 transition-all duration-300 active:bg-[#047857] ${
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
