import * as React from 'react';
import DropDownIcon from '../Icons/DropDownIcon';
import { Button } from './button';
import RangePicker from './rangePicker';

interface DropDownRangebuttonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  iconColor?: string;
  defaultOpen?: boolean;
  onApply: (range: [number, number]) => void;
  selectedRange: [number, number] | null;
}

const DropDownRangebutton = React.forwardRef<HTMLButtonElement, DropDownRangebuttonProps>(
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
    const [salaryRange, setSalaryRange] = React.useState<[number, number]>(
      selectedRange || [0, 500000]
    );

    const dropdownRef = React.useRef<HTMLDivElement>(null);

    // ✅ Close when clicked outside
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
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ✅ Reset when selected range changes externally
    React.useEffect(() => {
      setSalaryRange(selectedRange || [0, 500000]);
    }, [selectedRange]);

    return (
      <div className="relative inline-block" ref={dropdownRef}>
        {/* Button that toggles dropdown */}
        <button
          ref={ref}
          className={`flex w-full items-center justify-between rounded px-2 py-1 font-poppins text-xs sm:text-sm font-medium ${
            className || ''
          }`}
          onClick={() => setIsOpen((prev) => !prev)}
          {...props}
        >
          <p className="mb-0.5">
            {children}
            {selectedRange
              ? `: $${selectedRange[0].toLocaleString()} - $${selectedRange[1].toLocaleString()}`
              : ''}
          </p>
          <DropDownIcon color={iconColor} />
        </button>

        {/* Dropdown Content */}
        {isOpen && (
          <div className="absolute  z-[99999] mt-2 w-[300px] rounded-md bg-white shadow-lg ring-1 ring-gray-200 dark:bg-dark-30 dark:ring-dark-15 sm:w-[380px]">
            <div className="p-4">
              <h1 className="mb-4 text-base font-semibold dark:text-white">
                Salary Range
              </h1>

              {/* ✅ Range Slider */}
              <RangePicker
                min={0}
                max={500000}
                step={1000}
                selectedValue={salaryRange.sort((a, b) => a - b) as [number, number]}
                onChange={(values) => setSalaryRange(values as [number, number])}
              />

              {/* ✅ Apply Button */}
              <Button
                onClick={() => {
                  setIsOpen(false);
                  onApply(salaryRange);
                }}
                className="mt-3 w-full bg-[#10b981] text-white hover:bg-[#059669] transition-all py-2 rounded-md text-sm"
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

DropDownRangebutton.displayName = 'DropDownRangebutton';
export { DropDownRangebutton };
