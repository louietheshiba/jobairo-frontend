import React, { useState } from 'react';
import { MapPin, Briefcase, Building, Filter } from 'lucide-react';

import type { Option } from '@/types/FiltersType';
import type { SaveSearchProps } from '@/types/Index';

import { Button } from '../ui/button';
import { Select } from '../ui/select';
import AppliedFilters from './AppliedFilters';

interface ExtendedSaveSearchProps extends SaveSearchProps {
  showFilters?: boolean;
}

const SaveSearch = ({ setFilters, filters, handleChange, showFilters = false }: ExtendedSaveSearchProps) => {

  // Simplified filter options that match our database schema
  const locationOptions = [
    { id: 1, value: 'remote', label: 'Remote' },
    { id: 2, value: 'hybrid', label: 'Hybrid' },
    { id: 3, value: 'onsite', label: 'On-site' },
  ];

  const employmentTypeOptions = [
    { id: 1, value: 'full-time', label: 'Full Time' },
    { id: 2, value: 'part-time', label: 'Part Time' },
    { id: 3, value: 'contract', label: 'Contract' },
  ];

  const companySizeOptions = [
    { id: 1, value: 'startup', label: 'Startup (1-50)' },
    { id: 2, value: 'small', label: 'Small (51-200)' },
    { id: 3, value: 'medium', label: 'Medium (201-1000)' },
    { id: 4, value: 'large', label: 'Large (1000+)' },
  ];

  return (
    <div className="rounded-lg bg-white shadow-sm dark:bg-dark-20">
      {/* Collapsible Filter Section */}
      {showFilters && (
        <div className="px-6 pb-6 border-t border-gray-100 dark:border-gray-700 pt-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Filter Jobs
            </h3>

            {/* Main Filters Row */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Location */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <MapPin className="w-4 h-4" />
                  Location
                </label>
                <Select
                  value={filters?.locations?.[0] || null}
                  onChange={(selected) => {
                    const value = selected as Option;
                    handleChange('locations', value ? [value] : []);
                  }}
                  options={locationOptions}
                  placeholder="Select location type"
                />
              </div>

              {/* Employment Type */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Briefcase className="w-4 h-4" />
                  Job Type
                </label>
                <Select
                  value={employmentTypeOptions.find(opt => opt.value === filters?.jobType) || null}
                  onChange={(selected) => {
                    const value = selected as Option;
                    handleChange('jobType', value?.value || '');
                  }}
                  options={employmentTypeOptions}
                  placeholder="Select job type"
                />
              </div>

              {/* Company Size */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Building className="w-4 h-4" />
                  Company Size
                </label>
                <Select
                  value={companySizeOptions.find(opt => opt.value === filters?.companySize) || null}
                  onChange={(selected) => {
                    const value = selected as Option;
                    handleChange('companySize', value?.value || '');
                  }}
                  options={companySizeOptions}
                  placeholder="Select company size"
                />
              </div>

              {/* Salary Range - Simple text input for now */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Salary Range
                </label>
                <input
                  type="text"
                  placeholder="e.g. $50k - $80k"
                  value={filters?.salaryRange?.[0] ? `${filters.salaryRange[0]}k - ${filters.salaryRange[1]}k` : ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value) {
                      const parts = value.split('-');
                      const min = parts[0] ? parseInt(parts[0].trim()) || 0 : 0;
                      const max = parts[1] ? parseInt(parts[1].trim()) || 0 : 0;
                      handleChange('salaryRange', [min, max]);
                    } else {
                      handleChange('salaryRange', null);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-10 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Button
              onClick={() => {
                // Clear all filters
                handleChange('locations', []);
                handleChange('jobType', '');
                handleChange('companySize', '');
                handleChange('salaryRange', null);
              }}
              className="flex items-center justify-center !border-gray-300 !bg-white !text-gray-700 hover:!bg-gray-50 dark:!border-gray-600 dark:!bg-gray-800 dark:!text-gray-300 dark:hover:!bg-gray-700 !px-4 !py-2 !text-sm"
            >
              Clear All Filters
            </Button>

            <Button className="flex items-center justify-center gap-2 !border-primary-10 !bg-primary-10 !text-white hover:!border-primary-15 hover:!bg-primary-15 !px-4 !py-2 !text-sm">
              Save Search
            </Button>
          </div>
        </div>
      )}

      <AppliedFilters filterData={filters} setFilters={setFilters} />
    </div>
  );
};

export default SaveSearch;
