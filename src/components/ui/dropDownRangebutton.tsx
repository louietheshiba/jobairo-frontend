import * as React from 'react';

import DropDownIcon from '../Icons/DropDownIcon';
import { Button } from './button';
import RangePicker from './rangePicker';

interface DropDownRangebuttonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  iconColor?: string;
  defaultOpen?: boolean;
  onApply: (range: number[]) => void;
  selectedRange: number[] | null;
}

const DropDownRangebutton = React.forwardRef<
  HTMLButtonElement,
  DropDownRangebuttonProps
>(
  (
    {
      className,
      iconColor,
      defaultOpen = false,
      children,
      onApply,
      selectedRange,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);
    const [priceRange, setPriceRange] = React.useState<number[]>(
      selectedRange || [0, 1000]
    );

    const dropdownRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDropdown = () => setIsOpen((prev) => !prev);

    React.useEffect(() => {
      setPriceRange(selectedRange || [0, 1000]);
    }, [selectedRange]);

    return (
      <div className="relative inline-block" ref={dropdownRef}>
        <button
          ref={ref}
          className={`flex w-full items-center justify-between  rounded px-2 py-0.5 font-poppins text-xs font-medium  sm:text-sm ${
            className || ''
          }`}
          onClick={toggleDropdown}
          {...props}
        >
          <p className="mb-0.5">{children}</p>
          <DropDownIcon color={iconColor} />
        </button>

        {isOpen && (
          <div className="absolute right-0 z-[99999] mt-2 max-h-[300px] w-[320px] overflow-y-auto rounded-md bg-white shadow-lg ring-1 ring-gray-200 dark:bg-dark-30 dark:ring-dark-15 sm:right-auto sm:w-[380px]">
            <div className="p-4">
              <h1 className="mb-4 whitespace-nowrap text-base font-semibold dark:text-white">
                Salary Range
              </h1>
              <RangePicker
                min={0}
                max={1000}
                step={10}
                selectedValue={
                  priceRange?.sort((a, b) => a - b) as [number, number]
                }
                onChange={(values) => setPriceRange(values)}
              />
              <Button
                onClick={() => {
                  setIsOpen(false);
                  onApply(priceRange);
                }}
                className="mt-2 !border-primary-10 !bg-primary-10 !py-2 text-sm !text-white hover:!border-primary-15 hover:!bg-primary-15 hover:text-primary-15"
              >
                Apply
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }
);

DropDownRangebutton.displayName = 'DropDownButton';

export { DropDownRangebutton };
