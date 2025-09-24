import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Share2, X } from 'lucide-react';

import { useTheme } from '@/context/useTheme';
import type { Job, JobListProps } from '@/types/JobTypes';
import {
  DATE_POSTED_LIST,
  MARK_JOBS_LIST,
  RELEVANCE_LIST,
} from '@/utils/constant';
import { getAllJobs } from '@/utils/jobs';

import JobDetailsModal from '../Modals/JobDetail';
import { Button } from '../ui/button';
import { FilterDropDownbutton } from '../ui/filterDropDownbutton';
import JobListCard from '../ui/jobListCard';

const JobList = ({ filters, handleChange }: JobListProps) => {
  const { isDarkMode } = useTheme();
  const router = useRouter();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<null | Job>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await getAllJobs();
        console.log('data' , data)
        setJobs(data);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleCardClick = (job: Job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
  };

  const getActiveFilters = () => {
    const active = [];
    if (filters.position) active.push({ key: 'position', value: filters.position, label: `Position: ${filters.position}` });
    if (filters.locations.length) active.push(...filters.locations.map(loc => ({ key: 'locations', value: loc.value, label: `Location: ${loc.label}` })));
    if (filters.workSchedule.length) active.push(...filters.workSchedule.map(ws => ({ key: 'workSchedule', value: ws.value, label: ws.label })));
    if (filters.jobType) active.push({ key: 'jobType', value: filters.jobType, label: `Job Type: ${filters.jobType}` });
    if (filters.salaryRange) active.push({ key: 'salaryRange', value: filters.salaryRange, label: `Salary: $${filters.salaryRange[0]} - $${filters.salaryRange[1]}` });
    if (filters.education) active.push({ key: 'education', value: filters.education, label: `Education: ${filters.education}` });
    if (filters.experienceLevel) active.push({ key: 'experienceLevel', value: filters.experienceLevel, label: `Experience: ${filters.experienceLevel}` });
    if (filters.datePosted !== 'Date Posted') active.push({ key: 'datePosted', value: filters.datePosted, label: `Posted: ${filters.datePosted}` });
    return active;
  };

  const handleRemoveFilter = (filter: any) => {
    // Implement remove filter logic
    console.log('Remove filter', filter);
  };

  const handleShare = () => {
    const url = new URL(window.location.href);
    // Add filter params to URL
    if (filters.position) url.searchParams.set('position', filters.position);
    // Add other filters...
    navigator.clipboard.writeText(url.toString());
    alert('Link copied to clipboard!');
  };

  const activeFilters = getActiveFilters();

  return (
    <div className="px-[15px] pb-10 pt-6 sm:pb-[50px] sm:pt-[30px]">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 sm:gap-7">
        {/* Job count and filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {jobs.length} jobs found
            </h2>
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {activeFilters.map((filter, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 rounded-full bg-primary-10 px-3 py-1 text-sm text-white"
                  >
                    {filter.label}
                    <button
                      onClick={() => handleRemoveFilter(filter)}
                      className="ml-1 hover:text-gray-200"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <FilterDropDownbutton
              id="sort"
              iconColor={isDarkMode ? 'white' : '#666666'}
              className="!gap-1.5 !font-semibold text-themeGray-15 dark:text-white"
              options={RELEVANCE_LIST?.filter(
                ({ label }) => label !== 'Relevance'
              )}
              value={filters?.relevance}
              onChange={(val) => {
                handleChange('relevance', `${val}`);
              }}
            >
              Sort: {filters?.relevance}
            </FilterDropDownbutton>

            <Button
              onClick={handleShare}
              className="!flex !w-auto !items-center !gap-2 !bg-gray-100 !text-gray-700 hover:!bg-gray-200 dark:!bg-gray-700 dark:!text-gray-300"
            >
              <Share2 size={16} />
              Share
            </Button>
          </div>
        </div>

        <div className="grid gap-5 gap-y-[30px] sm:gap-y-[50px] md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <p>Loading jobs...</p>
          ) : (
            jobs.map((item) => (
              <JobListCard key={item.id} item={item} onClick={handleCardClick} />
            ))
          )}
        </div>
      </div>

      <JobDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        job={selectedJob}
      />
    </div>
  );
};

export default JobList;
