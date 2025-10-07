import React, { useState, useEffect } from 'react';
import { MapPin, Briefcase, Building } from 'lucide-react';
import toast from 'react-hot-toast';

import type { Option } from '@/types/FiltersType';
import type { SaveSearchProps } from '@/types/Index';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/utils/supabase';
import {
  EDUCATION_LIST,
  EXPERIENCE_LEVEL_LIST,
  JOB_TYPE_LIST,
} from '@/utils/constant';

import { DropDownButton } from '../ui/dropDownbutton';
import { DropDownRangebutton } from '../ui/dropDownRangebutton';

import { Button } from '../ui/button';
import { Select } from '../ui/select';
import AppliedFilters from './AppliedFilters';

interface ExtendedSaveSearchProps extends SaveSearchProps {
  showFilters?: boolean;
}

const SaveSearch = ({ setFilters, filters, handleChange, showFilters = false }: ExtendedSaveSearchProps) => {
  const { user } = useAuth();
  const [companyOptions, setCompanyOptions] = useState<Option[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Simplified filter options that match our database schema
  const locationOptions = [
    { id: 1, value: 'remote', label: 'Remote' },
    { id: 2, value: 'hybrid', label: 'Hybrid' },
    { id: 3, value: 'onsite', label: 'On-site' },
  ];


  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch('/api/jobs?limit=10000');
        const data = await response.json();
        const companies = data.jobs?.map((job: any) => job.company?.name).filter(Boolean) || [];
        const uniqueCompanies = [...new Set(companies)].map((name, index) => ({
          id: index + 1,
          value: name as string,
          label: name as string,
        }));
        setCompanyOptions(uniqueCompanies);
      } catch (error) {
        console.error('Error fetching companies:', error);
      }
    };
    fetchCompanies();
  }, []);

  const handleSaveSearch = async () => {
    if (!user) {
      toast.error('You need to login first');
      return;
    }

    if (isSaving) return;

    setIsSaving(true);

    try {
      const { error } = await supabase.from('saved_searches').insert({
        user_id: user.id,
        filters: filters,
      });

      if (error) throw error;

      toast.success('Search saved successfully! 🎉');
    } catch (error) {
      console.error('Error saving search:', error);
      toast.error('Failed to save search');
    } finally {
      setIsSaving(false);
    }
  };

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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 mb-4">
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
                  value={JOB_TYPE_LIST.find(opt => opt.value === filters?.jobType) || null}
                  onChange={(selected) => {
                    const value = selected as Option;
                    handleChange('jobType', value?.value || '');
                  }}
                  options={JOB_TYPE_LIST}
                  placeholder="Select job type"
                />
              </div>

              {/* Company */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Building className="w-4 h-4" />
                  Company
                </label>
                <Select
                  value={companyOptions.find(opt => opt.value === filters?.company) || null}
                  onChange={(selected) => {
                    const value = selected as Option;
                    handleChange('company', value?.value || '');
                  }}
                  options={companyOptions}
                  placeholder="Select company"
                />
              </div>


            </div>
          </div>
          

          <div className="grid grid-cols-2 items-center justify-center gap-1.5 md:flex mb-10">


            <DropDownRangebutton
              id="salaryRange"
              className="!w-full !bg-primary-10 !text-white"
              onApply={(range) => {
                handleChange('salaryRange', range);
              }}
              selectedRange={filters?.salaryRange || null}
            >
              Salary Range
            </DropDownRangebutton>

            <DropDownButton
              id="education"
              className="!w-full !bg-primary-10 !text-white"
              options={EDUCATION_LIST}
              value={filters?.education}
              onChange={(val) => {
                handleChange('education', `${val}`);
              }}
            >
              Education
            </DropDownButton>

            <DropDownButton
              id="experienceLevel"
              className="!w-full !bg-primary-10 !text-white"
              options={EXPERIENCE_LEVEL_LIST}
              value={filters?.experienceLevel}
              onChange={(val) => {
                handleChange('experienceLevel', `${val}`);
              }}
            >
              Experience Level
            </DropDownButton>
          </div>


          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Button
              onClick={() => {
                // Clear all filters
                handleChange('locations', []);
                handleChange('jobType', '');
                handleChange('company', '');
              }}
              className="flex items-center justify-center !border-gray-300 !bg-white !text-gray-700 hover:!bg-gray-50 dark:!border-dark-15 dark:!bg-dark-25 dark:!text-white dark:hover:!bg-dark-20 !px-4 !py-2 !text-sm"
            >
              Clear All Filters
            </Button>

            <Button
              onClick={handleSaveSearch}
              disabled={isSaving}
              className="flex items-center justify-center gap-2 !border-primary-10 !bg-primary-10 !text-white hover:!border-primary-15 hover:!bg-primary-15 !px-4 !py-2 !text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Search'}
            </Button>
          </div>
        </div>
      )}

      <div className="mt-4">
        <AppliedFilters filterData={filters} setFilters={setFilters} />
      </div>
    </div>
  );
};

export default SaveSearch;
