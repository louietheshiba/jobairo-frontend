import React from 'react';
import Select from 'react-select';
import { LocationOption, locationOptions } from '@/utils/locations';

interface LocationAutocompleteProps {
  value: string[];
  onChange: (locations: string[]) => void;
  placeholder?: string;
  isMulti?: boolean;
  className?: string;
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Search for cities...",
  isMulti = true,
  className = ""
}) => {
  // Convert string array to LocationOption array for react-select
  const selectedOptions = value
    .map(locationValue => locationOptions.find(opt => opt.value === locationValue))
    .filter(Boolean) as LocationOption[];

  // Convert LocationOption array back to string array
  const handleChange = (selected: any) => {
    if (isMulti) {
      const locationValues = selected ? selected.map((option: LocationOption) => option.value) : [];
      onChange(locationValues);
    } else {
      const locationValue = selected ? [selected.value] : [];
      onChange(locationValue);
    }
  };

  // Custom styles to match the app's design
  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: 'var(--tw-bg-opacity) 1',
      borderColor: state.isFocused ? '#00d4aa' : '#d1d5db',
      borderWidth: '1px',
      borderRadius: '0.5rem',
      boxShadow: state.isFocused ? '0 0 0 1px #00d4aa' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? '#00d4aa' : '#9ca3af',
      },
      minHeight: '2.5rem',
      fontSize: '0.875rem',
      padding: '0.125rem',
    }),
    input: (provided: any) => ({
      ...provided,
      color: 'inherit',
      fontSize: '0.875rem',
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: '#6b7280',
      fontSize: '0.875rem',
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: 'inherit',
      fontSize: '0.875rem',
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: '#00d4aa',
      borderRadius: '0.25rem',
      padding: '0.125rem 0.25rem',
    }),
    multiValueLabel: (provided: any) => ({
      ...provided,
      color: 'white',
      fontSize: '0.75rem',
      fontWeight: '500',
    }),
    multiValueRemove: (provided: any) => ({
      ...provided,
      color: 'white',
      ':hover': {
        backgroundColor: '#00b894',
        color: 'white',
      },
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: 'white',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      zIndex: 50,
    }),
    menuList: (provided: any) => ({
      ...provided,
      padding: '0.25rem',
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#00d4aa' : state.isFocused ? '#f3f4f6' : 'white',
      color: state.isSelected ? 'white' : 'inherit',
      fontSize: '0.875rem',
      padding: '0.5rem 0.75rem',
      cursor: 'pointer',
      ':active': {
        backgroundColor: state.isSelected ? '#00d4aa' : '#e5e7eb',
      },
    }),
    noOptionsMessage: (provided: any) => ({
      ...provided,
      color: '#6b7280',
      fontSize: '0.875rem',
    }),
  };

  // Custom filter function to prioritize US cities and show relevant results
  const filterOption = (option: any, inputValue: string) => {
    if (!inputValue) return true;
    const searchValue = inputValue.toLowerCase();
    return (
      option.data.label.toLowerCase().includes(searchValue) ||
      option.data.city.toLowerCase().includes(searchValue) ||
      (option.data.state && option.data.state.toLowerCase().includes(searchValue)) ||
      option.data.country.toLowerCase().includes(searchValue)
    );
  };

  return (
    <div className={className}>
      <Select
        isMulti={isMulti}
        value={selectedOptions}
        onChange={handleChange}
        options={locationOptions}
        placeholder={placeholder}
        styles={customStyles}
        filterOption={filterOption}
        menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
        menuPosition="fixed"
        classNamePrefix="location-select"
        components={{
          IndicatorSeparator: () => null, // Remove the separator line
        }}
        theme={(theme) => ({
          ...theme,
          colors: {
            ...theme.colors,
            primary: '#00d4aa',
            primary75: '#34d399',
            primary50: '#6ee7b7',
            primary25: '#d1fae5',
          },
        })}
      />
    </div>
  );
};

export default LocationAutocomplete;