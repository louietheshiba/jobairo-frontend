import React, { useCallback } from 'react';
import type { LiveJobsProps } from '@/types/JobTypes';
import HomeHeader from './HomeHeader';
import SaveSearch from './SaveSearch';
import SearchBar from './SearchBar';

const LiveJobs = ({ setFilters, filters, handleChange }: LiveJobsProps) => {
  const handleSearch = useCallback(
    (query: string, locations?: string | string[] | undefined) => {
      handleChange('position', query);
      if (locations) {
        const locArray = Array.isArray(locations)
          ? locations
          : (typeof locations === 'string' && locations.trim() !== '' ? [locations] : []);
        const locationOptions = locArray.map((value, index) => ({
          id: index + 1,
          value: value,
          label: value
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' '),
        }));

        handleChange('locations', locationOptions);
      } else {
        handleChange('locations', []);
      }
    },
    [handleChange]
  );

  return (
    <div className="bg-white px-[15px] pb-[5px] pt-[15px] dark:bg-dark-25 sm:pb-[5px]">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-3 sm:gap-6">
        <HomeHeader />
        <SearchBar onSearch={handleSearch} handleChange={handleChange} />
        <SaveSearch setFilters={setFilters} filters={filters} handleChange={handleChange} showFilters={true} />
      </div>
    </div>
  );
};

export default LiveJobs;
