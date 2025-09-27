/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
import axios from 'axios';
import { Search } from 'lucide-react';
import React, { useState } from 'react';

import useDebounce from '@/hooks/debounce';
import type { Option } from '@/types/FiltersType';
import type { SaveSearchProps } from '@/types/Index';
import {
  COMPANY_SIZE_LIST,
  DATE_POSTED_LIST,
  EDUCATION_LIST,
  EXPERIENCE_LEVEL_LIST,
  JOB_TYPE_LIST,
  SUGGETIONS,
  WORK_SCHEDULE_LIST,
} from '@/utils/constant';

import { Button } from '../ui/button';
import { DropDownButton } from '../ui/dropDownbutton';
import { DropDownRangebutton } from '../ui/dropDownRangebutton';
import { Select } from '../ui/select';
import AppliedFilters from './AppliedFilters';

const SaveSearch = ({ setFilters, filters, handleChange }: SaveSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [position, setPosition] = useState('');
  const [locationOptions, setLocationOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearchLocations = async ({ value }: { value: string }) => {
    try {
      if (value?.length > 2) {
        setIsLoading(true);
        const response = await axios.get(`locations?query=${value}`);
        setLocationOptions(response.data);
      }
    } catch (error: any) {
      console.error('error >> ', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedLocationSearch = useDebounce(handleSearchLocations, 300);

  return (
    <div className="flex flex-col gap-2.5 rounded-md bg-themeGray-5 p-[15px] dark:bg-dark-20 sm:gap-[14px] sm:px-7 sm:pb-4 sm:pt-6">
      <div className="flex flex-col items-center gap-2.5 lg:flex-row lg:gap-5">
        <div className="grid h-full w-full gap-2.5 lg:grid-cols-4 lg:gap-5">
          <div className="relative h-full max-h-[54px] w-full">
            <Select
              id="position"
              options={SUGGETIONS}
              hideSelectedOptions
              value={SUGGETIONS?.find(
                ({ label }) => filters?.position === label
              )}
              onChange={(selected) => {
                const value = selected as Option;

                handleChange('position', value?.label);
              }}
              onInputChange={(input) => {
                setPosition(input);
              }}
              placeholder="Search Position"
              menuIsOpen={!!position}
              isHideIcon
              isClearable
              isSearchIcon
            />

            <Search
              size={20}
              className="absolute left-3 top-3.5 text-primary-10"
            />
          </div>

          <Select
            id="location"
            options={locationOptions}
            value={null}
            onChange={(selected) => {
              const locations = [...filters.locations, selected] as Option[];

              const uniqueArray = locations.filter(
                (value, index, self) =>
                  index ===
                  self.findIndex((t) => t?.value === value?.value && t !== null)
              );

              handleChange('locations', uniqueArray as Option[]);
            }}
            onInputChange={(input) => {
              setSearchQuery(input);
              debouncedLocationSearch({ value: input });
            }}
            placeholder="Your City, Your State, or Remote"
            menuIsOpen={!!searchQuery}
            isHideIcon
            isClearable
            isLoading={isLoading}
          />

          <Select
            id="workSchedule"
            placeholder="Work Schedule"
            value={filters?.workSchedule}
            options={WORK_SCHEDULE_LIST}
            onChange={(selected) => {
              handleChange('workSchedule', selected as Option[]);
            }}
            isMulti
          />

          <Select
            id="datePosted"
            placeholder="Date Posted"
            value={DATE_POSTED_LIST?.find(
              ({ label }) => filters?.datePosted === label
            )}
            options={DATE_POSTED_LIST}
            onChange={(selected) => {
              const value = selected as Option;
              handleChange('datePosted', value?.label);
            }}
          />
        </div>

        <div className="flex w-full gap-2 md:max-w-[280px] md:flex-col">
          <Button className="flex w-full items-center justify-center !border-primary-10 !bg-primary-10 !text-white duration-300 hover:!border-primary-15 hover:!bg-primary-15">
            Apply Filters
          </Button>
          <Button
            onClick={() => {
              // Clear all filters
              handleChange('position', '');
              handleChange('locations', []);
              handleChange('workSchedule', []);
              handleChange('jobType', '');
              handleChange('salaryRange', null);
              handleChange('education', '');
              handleChange('experienceLevel', '');
              handleChange('datePosted', '');
              handleChange('companySize', '');
            }}
            className="flex w-full items-center justify-center !border-gray-300 !bg-white !text-gray-700 duration-300 hover:!bg-gray-50 dark:!border-gray-600 dark:!bg-gray-800 dark:!text-gray-300 dark:hover:!bg-gray-700"
          >
            Clear All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 items-center justify-center gap-1.5 md:flex">
        <DropDownButton
          id="jobType"
          className="!w-full !bg-primary-10 !text-white"
          options={JOB_TYPE_LIST}
          value={filters?.jobType}
          onChange={(val) => {
            handleChange('jobType', `${val}`);
          }}
        >
          Job Type
        </DropDownButton>

        <DropDownRangebutton
          id="salaryRange"
          className="!w-full !bg-primary-10 !text-white"
          onApply={(range) => {
            handleChange('salaryRange', range);
          }}
          selectedRange={filters?.salaryRange}
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

        <DropDownButton
          id="companySize"
          className="!w-full !bg-primary-10 !text-white"
          options={COMPANY_SIZE_LIST}
          value={filters?.companySize}
          onChange={(val) => {
            handleChange('companySize', `${val}`);
          }}
        >
          Company Size
        </DropDownButton>

        <Button className="col-span-2 flex w-full items-center justify-center gap-1 !rounded border-none !bg-primary-10 font-poppins !font-semibold !text-white md:w-auto md:!py-1 md:px-2 md:!text-sm">
          Save Search
        </Button>
      </div>

      <AppliedFilters filterData={filters} setFilters={setFilters} />
    </div>
  );
};

export default SaveSearch;
