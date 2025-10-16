import React, { useCallback, useMemo } from 'react';
import AsyncSelect from 'react-select/async';
import { LocationOption, locationOptions } from '@/utils/locations';
import { getAllCities, getAllStates, getAllCountries } from 'country-state-city';

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

  // Load options from static dataset (country-state-city)
  // Client-side filtering for better performance
  const allCities = useMemo(() => getAllCities(), []);
  const allStates = useMemo(() => getAllStates(), []);
  const allCountries = useMemo(() => getAllCountries(), []);

  const loadOptions = useCallback((inputValue: string) => {
    return new Promise<LocationOption[]>(resolve => {
      if (!inputValue || inputValue.trim().length === 0) {
        resolve([]);
        return;
      }

      const searchTerm = inputValue.toLowerCase().trim();
      const results: LocationOption[] = [];

      // Search cities first - prioritize exact matches and common patterns from job data
      const cityMatches = allCities
        .filter(city => {
          const cityName = city.name.toLowerCase();
          const stateName = city.stateCode?.toLowerCase() || '';
          const countryName = city.countryCode?.toLowerCase() || '';

          // Check for exact matches first
          if (cityName === searchTerm || stateName === searchTerm || countryName === searchTerm) {
            return true;
          }

          // Check for partial matches
          return cityName.includes(searchTerm) ||
                 stateName.includes(searchTerm) ||
                 countryName.includes(searchTerm);
        })
        .slice(0, 20) // Limit results
        .map(city => {
          const state = allStates.find(s => s.isoCode === city.stateCode && s.countryCode === city.countryCode);
          const country = allCountries.find(c => c.isoCode === city.countryCode);
          const label = `${city.name}${state ? `, ${state.name}` : ''}${country ? `, ${country.name}` : ''}`;
          return {
            value: label,
            label,
            country: country?.name || '',
            state: state?.name || '',
            city: city.name,
            priority: city.countryCode === 'US' ? 1 : 3
          };
        });

      // Search states if no city matches or to add more results
      const stateMatches = allStates
        .filter(state => {
          const stateName = state.name.toLowerCase();
          const countryName = state.countryCode?.toLowerCase() || '';

          // Check for exact matches first
          if (stateName === searchTerm || countryName === searchTerm) {
            return true;
          }

          // Check for partial matches
          return stateName.includes(searchTerm) || countryName.includes(searchTerm);
        })
        .slice(0, 10)
        .map(state => {
          const country = allCountries.find(c => c.isoCode === state.countryCode);
          const label = `${state.name}${country ? `, ${country.name}` : ''}`;
          return {
            value: label,
            label,
            country: country?.name || '',
            state: state.name,
            city: '',
            priority: state.countryCode === 'US' ? 1 : 3
          };
        });

      results.push(...cityMatches, ...stateMatches);

      // Search countries if still no matches or to add more results
      if (results.length < 5) {
        const countryMatches = allCountries
          .filter(country => {
            const countryName = country.name.toLowerCase();

            // Check for exact matches first
            if (countryName === searchTerm) {
              return true;
            }

            // Check for partial matches
            return countryName.includes(searchTerm);
          })
          .slice(0, 5)
          .map(country => ({
            value: country.name,
            label: country.name,
            country: country.name,
            state: '',
            city: '',
            priority: 2
          }));
        results.push(...countryMatches);
      }

      // Deduplicate and sort by priority (lower number = higher priority)
      const seen = new Set();
      const dedup = results
        .filter(item => {
          if (seen.has(item.value)) return false;
          seen.add(item.value);
          return true;
        })
        .sort((a, b) => {
          // First sort by priority
          if (a.priority !== b.priority) {
            return a.priority - b.priority;
          }
          // Then by exact match relevance
          const aExact = a.city.toLowerCase() === searchTerm ||
                        (a.state && a.state.toLowerCase() === searchTerm) ||
                        a.country.toLowerCase() === searchTerm;
          const bExact = b.city.toLowerCase() === searchTerm ||
                        (b.state && b.state.toLowerCase() === searchTerm) ||
                        b.country.toLowerCase() === searchTerm;
          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;
          return a.label.localeCompare(b.label);
        })
        .slice(0, 10); // Limit to 10 results

      resolve(dedup);
    });
  }, [allCities, allStates, allCountries]);

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