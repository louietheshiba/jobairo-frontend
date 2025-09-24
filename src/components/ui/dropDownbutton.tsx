/* eslint-disable no-nested-ternary */
import * as React from 'react';

import DropDownIcon from '../Icons/DropDownIcon';

interface DropDownButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  iconColor?: string;
  options?: { id: string | number; label: string; value: string }[];
  isMulti?: boolean;
  defaultOpen?: boolean;
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
}

const DropDownButton = React.forwardRef<HTMLButtonElement, DropDownButtonProps>(
  (
    {
      className,
      iconColor,
      options,
      isMulti = false,
      defaultOpen = false,
      value,
      onChange,
      children,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);
    const [selectedValues, setSelectedValues] = React.useState<string[]>(
      Array.isArray(value) ? value : value ? [value] : []
    );
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      if (value !== undefined) {
        setSelectedValues(Array.isArray(value) ? value : value ? [value] : []);
      }
    }, [value]);

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

    const handleSelect = (selectedValue: string) => {
      let newValues: string[];

      if (isMulti) {
        newValues = selectedValues.includes(selectedValue)
          ? selectedValues.filter((v) => v !== selectedValue)
          : [...selectedValues, selectedValue];
      } else {
        newValues = [selectedValue];
        setIsOpen(false);
      }

      setSelectedValues(newValues);
      onChange?.(isMulti ? newValues : newValues[0] ?? '');
    };

    return (
      <div className="relative inline-block" ref={dropdownRef}>
        <button
          ref={ref}
          className={`flex w-full items-center justify-between gap-1 rounded px-2 py-0.5 font-poppins text-xs font-medium sm:w-auto sm:text-sm ${
            className || ''
          }`}
          onClick={toggleDropdown}
          {...props}
        >
          <p className="my-0.5">{children}</p>
          <DropDownIcon color={iconColor} />
        </button>

        {isOpen && options && options?.length > 0 && (
          <div className="absolute left-0 z-[99999] mt-2  max-h-[200px] w-auto min-w-full overflow-y-auto rounded-md bg-white shadow-lg ring-1 ring-gray-200 dark:bg-dark-30 dark:ring-dark-15">
            <ul className="py-1">
              {options?.map((option) => (
                <li
                  key={option?.value}
                  className={`flex cursor-pointer items-center whitespace-nowrap px-3 py-1 font-poppins text-sm hover:bg-gray-100 dark:hover:bg-dark-20 ${
                    selectedValues.includes(option.value)
                      ? 'bg-gray-200 dark:bg-dark-20 dark:text-white'
                      : 'dark:text-white'
                  }`}
                  onClick={() => handleSelect(option.value)}
                >
                  {option?.label}
                  {isMulti && selectedValues.includes(option.value) && (
                    <span className="ml-auto text-green-500">✓</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
);

DropDownButton.displayName = 'DropDownButton';

export { DropDownButton };
