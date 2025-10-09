/* eslint-disable no-nested-ternary */
/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import type { Props as SelectProps } from 'react-select';
import SelectLib, { components } from 'react-select';

import { useTheme } from '@/context/useTheme';

import DropDownIcon from '../Icons/DropDownIcon';

interface CustomSelectProps<T> extends SelectProps<T> {
  isHideIcon?: boolean;
  isSearchIcon?: boolean;
}

const DropdownIndicator = ({ isHideIcon, ...props }: any) => {
  return !isHideIcon ? (
    <components.DropdownIndicator {...props}>
      <DropDownIcon color="#CCCCCC" />
    </components.DropdownIndicator>
  ) : null;
};

const Select = <T,>({
  isHideIcon = false,
  isSearchIcon = false,
  ...props
}: CustomSelectProps<T>) => {
  const { isDarkMode } = useTheme();

  return (
    <SelectLib
      className="w-full font-poppins text-base font-semibold"
      classNamePrefix="react-select"
      components={{
        DropdownIndicator: (indicatorProps) => (
          <DropdownIndicator {...indicatorProps} isHideIcon={isHideIcon} />
        ),
      }}
      styles={{
        control: (base) => ({
          ...base,
          width: '100%',
          borderRadius: '12px',
          border: `2px solid ${isDarkMode ? '#575757' : '#e0e0e0'}`,
          padding: '8px 18px',
          backgroundColor: isDarkMode ? '#282828' : 'white',
          boxShadow: 'none',
          transition: 'all 0.3s ease',
          '&:hover': { borderColor: '#00d4aa' },
          '&:focus-within': {
            borderColor: '#00d4aa',
            boxShadow: '0 0 0 3px rgba(0, 212, 170, 0.1)',
          },
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          paddingLeft: isSearchIcon ? '26px' : '',
        }),
        menuList: (base) => ({
          ...base,
          backgroundColor: isDarkMode ? '#282828' : 'white',
          border: `1px solid ${isDarkMode ? '#575757' : 'white'}`,
        }),
        option: (base, { isFocused, isSelected }) => ({
          ...base,
          backgroundColor: isDarkMode
            ? isSelected
              ? '#3f3f3f'
              : isFocused
              ? '#575757'
              : '#282828'
            : isSelected
            ? '#E6E6E6'
            : isFocused
            ? '#F0F0F0'
            : 'white',
          color: isDarkMode ? '#FFFFFF' : '#000000',
        }),
        placeholder: (base) => ({
          ...base,
          color: '#CCCCCC',
        }),
        menu: (base) => ({
          ...base,
          zIndex: 10,
        }),
        indicatorSeparator: () => ({
          display: 'none',
        }),
        input: (base) => ({
          ...base,
          color: !isDarkMode ? '#000000' : '#FFFFFF',
        }),
        multiValue: (base) => ({
          ...base,
          padding: 0,
          margin: '0px 4px 0px 0px',
        }),
        singleValue: (base) => ({
          ...base,
          color: !isDarkMode ? '#000000' : '#FFFFFF',
        }),
      }}
      {...props}
    />
  );
};

export { Select };
