import React, { useCallback } from 'react';

import type { LiveJobsProps } from '@/types/JobTypes';

import HomeHeader from './HomeHeader';
import SaveSearch from './SaveSearch';
import SearchBar from './SearchBar';

const LiveJobs = ({ setFilters, filters, handleChange }: LiveJobsProps) => {
  const handleSearch = useCallback((query: string) => {
    handleChange('position', query);
  }, [handleChange]);

  return (
    <div className="bg-white px-[15px] pb-[5px] pt-[15px] dark:bg-dark-25 sm:pb-[5px]">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-3 sm:gap-6">
        <HomeHeader />
        <SearchBar
          onSearch={handleSearch}
          handleChange={handleChange}
        />

        <SaveSearch
          setFilters={setFilters}
          filters={filters}
          handleChange={handleChange}
          showFilters={true}
        />
      </div>
    </div>
  );
};

export default LiveJobs;
