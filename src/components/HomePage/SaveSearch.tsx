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
import AppliedFilters from './AppliedFilters';

// ✅ Hook to detect Tailwind's dark mode class
const useIsDark = () => {
  const [isDark, setIsDark] = useState(
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return isDark;
};

interface ExtendedSaveSearchProps extends SaveSearchProps {
  showFilters?: boolean;
}

const SaveSearch = ({ setFilters, filters, handleChange, showFilters = false }: ExtendedSaveSearchProps) => {
  const { user } = useAuth();
  const [companyOptions, setCompanyOptions] = useState<Option[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const isDark = useIsDark(); // 👈 detect dark mode

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch('/api/jobs?limit=1000');
        const data = await response.json();
        const companies =
          data.jobs?.map((job: any) => job.companies?.name).filter(Boolean) || [];
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

  // ✅ Shared dark/light styles for all Selects
  const getSelectStyles = () => ({
    control: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: isDark ? '#282828' : '#ffffff',
      borderColor: state.isFocused ? '#10b981' : isDark ? '#374151' : '#d1d5db',
      borderWidth: '1px',
      borderRadius: '0.5rem',
      boxShadow: state.isFocused ? '0 0 0 1px #10b981' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? '#10b981' : isDark ? '#6b7280' : '#9ca3af',
      },
      minHeight: '2.5rem',
      fontSize: '0.875rem',
      padding: '0.125rem',
      color: isDark ? '#ffffff' : '#000000',
    }),
    input: (provided: any) => ({
      ...provided,
      color: isDark ? '#ffffff' : '#000000',
      fontSize: '0.875rem',
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: isDark ? '#9ca3af' : '#6b7280',
      fontSize: '0.875rem',
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: isDark ? '#ffffff' : '#000000',
      fontSize: '0.875rem',
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: isDark ? '#000000' : '#ffffff',
      border: '1px solid #10b981',
      borderRadius: '0.5rem',
      boxShadow:
        '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      zIndex: 50,
    }),
    menuList: (provided: any) => ({
      ...provided,
      padding: '0.25rem',
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? '#10b981'
        : state.isFocused
        ? (isDark ? '#111827' : '#f3f4f6')
        : isDark
        ? '#000000'
        : '#ffffff',
      color: state.isSelected ? '#ffffff' : isDark ? '#ffffff' : '#000000',
      fontSize: '0.875rem',
      padding: '0.5rem 0.75rem',
      cursor: 'pointer',
      ':active': {
        backgroundColor: state.isSelected
          ? '#10b981'
          : isDark
          ? '#1f2937'
          : '#e5e7eb',
      },
    }),
    noOptionsMessage: (provided: any) => ({
      ...provided,
      color: isDark ? '#9ca3af' : '#6b7280',
      fontSize: '0.875rem',
    }),
  });

  return (
    <div className="rounded-lg bg-white shadow-sm dark:bg-dark-20">
      {showFilters && (
        <div className="px-4 pt-2 pb-2">
          <div className="mb-2">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
              Filter Jobs
            </h3>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 mb-1">
              {/* Job Type */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Briefcase className="w-[18px] h-[18px] text-[#10b981]" />
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
                  styles={getSelectStyles()}
                />
              </div>

              {/* Company */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Users className="w-[18px] h-[18px] text-[#10b981]" />
                  Company
                </label>
                <Select
                  value={companyOptions.find(opt => opt.value === filters?.company) || null}
                  onChange={(selected) => {
                    const value = selected as Option;
                    handleChange('company', value?.value || '');
                  }}
                  options={companyOptions}
                  placeholder="Search for companies..."
                  isSearchable
                  styles={getSelectStyles()}
                />
              </div>

              {/* Work Setting */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <MapPin className="w-[18px] h-[18px] text-[#10b981]" />
                  Work Setting
                </label>
                <Select
                  value={
                    WORK_SCHEDULE_LIST.find(
                      (opt) => opt.value === filters?.workSchedule?.[0]?.value
                    ) || null
                  }
                  onChange={(selected) => {
                    const value = selected as Option;
                    handleChange('workSchedule', value ? [value] : []);
                  }}
                  options={WORK_SCHEDULE_LIST}
                  placeholder="Select work setting"
                  styles={getSelectStyles()}
                />
              </div>
            </div>
          </div>

          {/* Other filters + buttons */}
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 md:grid-cols-3 lg:flex lg:flex-wrap lg:gap-2">
            <DropDownRangebutton
              id="salaryRange"
              className="w-full bg-[#10b981] text-white font-semibold rounded-lg py-1 px-2 flex items-center justify-between"
              onApply={(range) => handleChange('salaryRange', range)}
              selectedRange={filters?.salaryRange || null}
            >
              Salary Range
            </DropDownRangebutton>

            <DropDownButton
              id="education"
              className="w-full bg-[#10b981] text-white font-semibold rounded-lg py-1 px-2 flex items-center justify-between"
              options={EDUCATION_LIST}
              value={filters?.education}
              onChange={(val) => handleChange('education', `${val}`)}
            >
              Education
            </DropDownButton>

            <DropDownButton
              id="experienceLevel"
              className="w-full bg-[#10b981] text-white font-semibold rounded-lg py-1 px-2 flex items-center justify-between"
              options={EXPERIENCE_LEVEL_LIST}
              value={filters?.experienceLevel}
              onChange={(val) => handleChange('experienceLevel', `${val}`)}
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
