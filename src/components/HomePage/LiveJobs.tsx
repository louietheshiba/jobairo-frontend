import React, { useState } from 'react';

import type { LiveJobsProps } from '@/types/JobTypes';

import HomeHeader from './HomeHeader';
import SaveSearch from './SaveSearch';
import SearchBar from './SearchBar';

const LiveJobs = ({ setFilters, filters, handleChange }: LiveJobsProps) => {
  const handleSearch = (query: string) => {
    handleChange('position', query);
  };

  return (
    <div className="bg-white px-[15px] pb-[10px] pt-[20px] dark:bg-dark-25 sm:pb-[10px]">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 sm:gap-10">
        <HomeHeader />
        <SearchBar
          onSearch={handleSearch}
          filters={filters}
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
