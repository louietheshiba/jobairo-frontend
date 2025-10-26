'use client';
import React, { useCallback, useMemo } from 'react';
import AsyncSelect from 'react-select/async';
import { getAllCities, getAllStates, getAllCountries } from 'country-state-city';
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
  className = "",
}) => {
  const selectedOptions = value.map((locationValue) => {
    const found = locationOptions.find((opt) => opt.value === locationValue);
    return (
      found || {
        value: locationValue,
        label: locationValue,
        country: '',
        state: '',
        city: locationValue,
        priority: 2,
      }
    );
  });

  const handleChange = (selected: any) => {
    if (isMulti) {
      onChange(selected ? selected.map((opt: LocationOption) => opt.value) : []);
    } else {
      onChange(selected ? [selected.value] : []);
    }
  };

  const allCities = useMemo(() => getAllCities(), []);
  const allStates = useMemo(() => getAllStates(), []);
  const allCountries = useMemo(() => getAllCountries(), []);

  const loadOptions = useCallback(
    (inputValue: string) =>
      new Promise<LocationOption[]>((resolve) => {
        const searchTerm = inputValue?.toLowerCase().trim() || '';

        if (!searchTerm) {
          // Default countries for initial display
          const defaultCountries = allCountries.slice(0, 20).map((country) => ({
            value: country.name,
            label: country.name,
            country: country.name,
            state: '',
            city: '',
            priority: 2,
          }));
          resolve(defaultCountries);
          return;
        }

        const results: LocationOption[] = [];

        const cityMatches:any = allCities
          .filter((city) => city.name.toLowerCase().includes(searchTerm))
          .slice(0, 20)
          .map((city) => {
            const state = allStates.find(
              (s) => s.isoCode === city.stateCode && s.countryCode === city.countryCode
            );
            const country = allCountries.find((c) => c.isoCode === city.countryCode);
            const label = `${city.name}${state ? `, ${state.name}` : ''}${
              country ? `, ${country.name}` : ''
            }`;
            return { value: label, label, country: country?.name || '', state: state?.name || '', city: city.name };
          });

        results.push(...cityMatches);

        if (results.length < 5) {
          const countryMatches:any = allCountries
            .filter((country) => country.name.toLowerCase().includes(searchTerm))
            .slice(0, 5)
            .map((country) => ({
              value: country.name,
              label: country.name,
              country: country.name,
              state: '',
              city: '',
            }));
          results.push(...countryMatches);
        }

        resolve(results);
      }),
    [allCities, allStates, allCountries]
  );

  return (
    <div className={className}>
      <AsyncSelect
        cacheOptions
        defaultOptions={true}
        loadOptions={loadOptions}
        isMulti={isMulti}
        value={selectedOptions}
        onChange={handleChange}
        placeholder={placeholder}
        styles={{
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
          control: (base, state) => ({
            ...base,
            borderColor: state.isFocused ? '#10b981' : '#d1d5db',
            boxShadow: state.isFocused ? '0 0 0 1px #10b981' : 'none',
          }),
        }}
        menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
        menuPosition="fixed"
        classNamePrefix="location-select"
        components={{ IndicatorSeparator: () => null }}
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
