import React, { useCallback } from 'react';
import AsyncSelect from 'react-select/async';
import { LocationOption, locationOptions } from '@/utils/locations';
import { useRef } from 'react';

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
  // Build selected options even if they aren't in the static `locationOptions` list
  const selectedOptions = value
    .map(locationValue => {
      const found = locationOptions.find(opt => opt.value === locationValue);
      if (found) return found;
      // If not found in static list, create a simple option so AsyncSelect can render it
      return {
        value: locationValue,
        label: locationValue,
        country: '',
        state: '',
        city: locationValue,
        priority: 2,
      } as LocationOption;
    })
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
      borderColor: state.isFocused ? '#10b981' : '#d1d5db',
      borderWidth: '1px',
      borderRadius: '0.5rem',
      boxShadow: state.isFocused ? '0 0 0 1px #10b981' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? '#10b981' : '#9ca3af',
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
      backgroundColor: '#10b981',
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
        backgroundColor: '#047857',
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
      backgroundColor: state.isSelected ? '#10b981' : state.isFocused ? '#f3f4f6' : 'white',
      color: state.isSelected ? 'white' : 'inherit',
      fontSize: '0.875rem',
      padding: '0.5rem 0.75rem',
      cursor: 'pointer',
      ':active': {
        backgroundColor: state.isSelected ? '#10b981' : '#e5e7eb',
      },
    }),
    noOptionsMessage: (provided: any) => ({
      ...provided,
      color: '#6b7280',
      fontSize: '0.875rem',
    }),
  };

  // Load options from server (Nominatim proxy)
  // Debounced loadOptions to avoid spamming the API while typing
  const debounceTimer = useRef<number | null>(null);
  const loadOptions = useCallback((inputValue: string) => {
    return new Promise<LocationOption[]>(resolve => {
      if (!inputValue || inputValue.trim().length === 0) {
        resolve([]);
        return;
      }

      // Clear previous timer
      if (debounceTimer.current) {
        window.clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
      }

      debounceTimer.current = window.setTimeout(async () => {
        try {
          const res = await fetch(`/api/locations/search?q=${encodeURIComponent(inputValue)}`);
          if (!res.ok) {
            resolve([]);
            return;
          }
          const json = await res.json();
          const results = json.results || [];

          const mapped: LocationOption[] = results.map((r: any) => ({
            value: (r.label || '').trim(),
            label: r.label,
            country: r.country || '',
            state: r.state || '',
            city: r.city || r.label,
            priority: r.country_code === 'us' ? 1 : 3
          }));

          // Deduplicate
          const seen = new Set();
          const dedup = mapped.filter(item => {
            if (seen.has(item.value)) return false;
            seen.add(item.value);
            return true;
          });

          resolve(dedup);
        } catch (err) {
          console.error('Error loading location options', err);
          resolve([]);
        }
      }, 300); // 300ms debounce
    });
  }, []);

  return (
    <div className={className}>
      <AsyncSelect
        cacheOptions
        defaultOptions={false}
        loadOptions={loadOptions}
        isMulti={isMulti}
        value={selectedOptions}
        onChange={handleChange}
        placeholder={placeholder}
        styles={customStyles}
        menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
        menuPosition="fixed"
        classNamePrefix="location-select "
        components={{
          IndicatorSeparator: () => null, // Remove the separator line
        }}
        theme={(theme) => ({
          ...theme,
          colors: {
            ...theme.colors,
            primary: '#10b981',
            primary75: '#047857',
            primary50: '#6ee7b7',
            primary25: '#d1fae5',
          },
        })}
      />
    </div>
  );
};

export default LocationAutocomplete;