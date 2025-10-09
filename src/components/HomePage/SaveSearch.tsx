import React, { useState, useEffect } from 'react';
import { MapPin, Briefcase, Users } from 'lucide-react';
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
                  <MapPin className="w-[18px] h-[18px] text-[#00d4aa]" />
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
                  <Briefcase className="w-[18px] h-[18px] text-[#00d4aa]" />
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
                  <Users className="w-[18px] h-[18px] text-[#00d4aa]" />
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
          

          <div className="flex items-center gap-3 mb-4">
            <DropDownRangebutton
              id="salaryRange"
              className="w-50 bg-[#00d4aa] text-white font-semibold rounded-lg px-3 py-1.5 shadow-[0_4px_15px_rgba(0,212,170,0.3)] hover:bg-[#00b894] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,212,170,0.4)] transition-all duration-300"
              onApply={(range) => {
                handleChange('salaryRange', range);
              }}
              selectedRange={filters?.salaryRange || null}
            >
              Salary Range
            </DropDownRangebutton>

            <DropDownButton
              id="education"
              className="w-[30%] bg-[#00d4aa] text-white font-semibold rounded-lg px-3 py-1.5 shadow-[0_4px_15px_rgba(0,212,170,0.3)] hover:bg-[#00b894] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,212,170,0.4)] transition-all duration-300"
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
              className="w-[30%] bg-[#00d4aa] text-white font-semibold rounded-lg px-3 py-1.5 shadow-[0_4px_15px_rgba(0,212,170,0.3)] hover:bg-[#00b894] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,212,170,0.4)] transition-all duration-300"
              options={EXPERIENCE_LEVEL_LIST}
              value={filters?.experienceLevel}
              onChange={(val) => {
                handleChange('experienceLevel', `${val}`);
              }}
            >
              Experience Level
            </DropDownButton>

<Button
              onClick={handleSaveSearch}
              disabled={isSaving}
              
              className=" w-52 bg-gradient-to-r from-[#00d4aa] to-[#00b894] text-white font-semibold rounded-lg shadow-[0_4px_15px_rgba(0,212,170,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,212,170,0.4)] transition-all duration-300 px-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Search'}
            </Button>
            <Button
              onClick={() => {
                // Clear all filters
                handleChange('locations', []);
                handleChange('jobType', '');
                handleChange('company', '');
              }}
              className="w-52 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-[0_4px_15px_rgba(0,212,170,0.3)] hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,212,170,0.4)] transition-all duration-300 px-3  text-sm dark:bg-dark-25 dark:border-dark-15 dark:text-white dark:hover:bg-dark-20"
            >
              Clear All Filters
            </Button>

            
          </div>
        </div>
      )}

      <div className="mt-2">
        <AppliedFilters filterData={filters} setFilters={setFilters} />
      </div>
    </div>
  );
};

export default SaveSearch;
