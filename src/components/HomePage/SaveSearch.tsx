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
  WORK_SCHEDULE_LIST,
} from '@/utils/constant';

import { DropDownButton } from '../ui/dropDownbutton';
import { DropDownRangebutton } from '../ui/dropDownRangebutton';

import { Select } from '../ui/select';
import LocationAutocomplete from '../ui/LocationAutocomplete';
import AppliedFilters from './AppliedFilters';

interface ExtendedSaveSearchProps extends SaveSearchProps {
  showFilters?: boolean;
}

const SaveSearch = ({ setFilters, filters, handleChange, showFilters = false }: ExtendedSaveSearchProps) => {
  const { user } = useAuth();
  const [companyOptions, setCompanyOptions] = useState<Option[]>([]);
  const [isSaving, setIsSaving] = useState(false);



  useEffect(() => {
    const fetchCompanies = async () => {
      try {
  const response = await fetch('/api/jobs?limit=1000');
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
      <div className="px-4 border-t border-gray-100 dark:border-gray-700 pt-2 pb-2">
        <div className="mb-2">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
            Filter Jobs
          </h3>

          {/* Main Filters Row */}
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 mb-1">
            {/* Location */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <MapPin className="w-[18px] h-[18px] text-[#10b981]" />
                Location
              </label>
              <LocationAutocomplete
                value={filters?.locations?.map(loc => loc.value) || []}
                onChange={(locationValues) => {
                  const locationOptions = locationValues.map((value, index) => ({
                    id: index + 1,
                    value: value,
                    label: value.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                  }));
                  handleChange('locations', locationOptions);
                }}
                placeholder="Search for cities..."
                isMulti={true}
                className='text-base font-semibold'
              />
            </div>

            {/* Employment Type */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Briefcase className="w-[18px] h-[18px] text-[#10b981]" />
                Job Type
              </label>
              <Select
                value={
                  JOB_TYPE_LIST.find(
                    (opt) => opt.value === filters?.jobType
                  ) || null
                }
                onChange={(selected) => {
                  const value = selected as Option;
                  handleChange('jobType', value?.value || '');
                }}
                options={JOB_TYPE_LIST}
                placeholder="Select job type"
                className="font-semibold"
                menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                menuPosition="fixed"
                classNamePrefix="job-type-select"
                styles={{
                  control: (provided: any, state: any) => ({
                    ...provided,
                    backgroundColor: 'var(--tw-bg-opacity) 1',
                    borderColor: state.isFocused ? '#10b981' : '#d1d5db',
                    borderWidth: '1px',
                    borderRadius: '0.5rem',
                    boxShadow: state.isFocused ? '0 0 0 1px #10b981' : 'none',
                    '&:hover': {
                      borderColor: state.isFocused ? '#10b981' : '#d1d5db',
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

            {/* Company */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Users className="w-[18px] h-[18px] text-[#10b981]" />
                Company
              </label>
              <Select
                value={
                  companyOptions.find(
                    (opt) => opt.value === filters?.company
                  ) || null
                }
                onChange={(selected) => {
                  const value = selected as Option;
                  handleChange('company', value?.value || '');
                }}
                options={companyOptions}
                placeholder="Search for companies..."
                className="font-semibold"
                isSearchable={true}
                menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                menuPosition="fixed"
                classNamePrefix="company-select"
                styles={{
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
                  menu: (provided: any) => ({
                    ...provided,
                    backgroundColor: 'white',
                    border: '1px solid #10b981',
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
          </div>
        </div>

<div className='grid grid-cols-1 gap-1 sm:grid-cols-2 md:grid-cols-3 lg:flex lg:flex-wrap lg:gap-2'>
  <DropDownRangebutton
    id="salaryRange"
    className="w-full lg:w-52 bg-[#10b981] text-white font-semibold rounded-lg shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 transition-all duration-300 py-1 px-2 flex items-center"
    onApply={(range) => {
      handleChange('salaryRange', range);
    }}
    selectedRange={filters?.salaryRange || null}
  >
    Salary Range
  </DropDownRangebutton>
  <DropDownButton
    id="workSchedule"
    className="w-full bg-[#10b981] gap-2 text-white font-semibold rounded-lg shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 transition-all duration-300 py-1 px-2 flex items-center active:bg-[#047857]"
    options={WORK_SCHEDULE_LIST}
    value={filters?.workSchedule?.[0]?.value || ''}
    onChange={(val) => {
      const selectedOption = WORK_SCHEDULE_LIST.find(opt => opt.value === val);
      handleChange('workSchedule', selectedOption ? [selectedOption] : []);
    }}
  >
    Work Setting
  </DropDownButton>
  <DropDownButton
    id="education"
    className="w-full bg-[#10b981] gap-2 text-white font-semibold rounded-lg shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 transition-all duration-300 py-1 px-2 flex items-center active:bg-[#047857]"
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
    className="w-full bg-[#10b981] gap-2 text-white font-semibold rounded-lg shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 transition-all duration-300 py-1 px-2 flex items-center active:bg-[#047857]"
    options={EXPERIENCE_LEVEL_LIST}
    value={filters?.experienceLevel}
    onChange={(val) => {
      handleChange('experienceLevel', `${val}`);
    }}
  >
    Experience Level
  </DropDownButton>
  <div className='flex flex-col sm:flex-row gap-2 lg:gap-3 lg:flex-row'>
    <button
      onClick={handleSaveSearch}
      disabled={isSaving}
      className="w-full sm:w-auto  gap-2 bg-[#10b981] text-white font-semibold rounded-lg shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] transition-all duration-300 py-1 px-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center active:bg-[#047857]"
    >
      {isSaving ? 'Saving...' : 'Save Search'}
    </button>
    <button
      onClick={() => {
        handleChange('locations', []);
        handleChange('jobType', '');
        handleChange('company', '');
        handleChange('salaryRange', null);
        handleChange('workSchedule', []);
        handleChange('education', '');
        handleChange('experienceLevel', '');
      }}
      className="w-full sm:w-auto bg-white border border-red-600 text-red-600 font-semibold rounded-lg shadow-[0_4px_15px_rgba(0,212,170,0.1)] hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,212,170,0.2)] transition-all duration-300 py-1 px-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
    >
      Clear All Filters
    </button>
  </div>
</div>
        </div>
      )}

      <div className="pb-4">
        <AppliedFilters filterData={filters} setFilters={setFilters} />
      </div>
    </div>
  );

};

export default SaveSearch;
