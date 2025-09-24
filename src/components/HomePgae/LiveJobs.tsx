import React, { useState } from 'react';
import { Filter } from 'lucide-react';

import type { LiveJobsProps } from '@/types/JobTypes';

import { Button } from '../ui/button';
import HomeHeader from './HomeHeader';
import SaveSearch from './SaveSearch';
import SearchBar from './SearchBar';

const LiveJobs = ({ setFilters, filters, handleChange }: LiveJobsProps) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (query: string) => {
    handleChange('position', query);
  };

  return (
    <div className="bg-white px-[15px] pb-[30px] pt-[50px]  dark:bg-dark-25 sm:pb-[50px] lg:pt-[100px]">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 sm:gap-10">
        <HomeHeader />
        <SearchBar
          onSearch={handleSearch}
          filters={filters}
          handleChange={handleChange}
        />

        {/* Mobile filter button */}
        <div className="flex justify-center md:hidden">
          <Button
            onClick={() => setShowFilters(true)}
            className="!flex !w-auto !items-center !gap-2 !bg-primary-10 !text-white"
          >
            <Filter size={16} />
            Filters
          </Button>
        </div>

        {/* Desktop filters always visible */}
        <div className="hidden md:block">
          <SaveSearch
            setFilters={setFilters}
            filters={filters}
            handleChange={handleChange}
          />
        </div>

        {/* Mobile filters modal */}
        {showFilters && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 md:hidden">
            <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <SaveSearch
                setFilters={setFilters}
                filters={filters}
                handleChange={handleChange}
              />
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={() => setShowFilters(false)}
                  className="!bg-primary-10 !text-white"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveJobs;
