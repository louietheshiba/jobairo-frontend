import React, { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

import type { Job, JobListProps } from '@/types/JobTypes';

import JobDetailsModal from '../Modals/JobDetail';
import JobListCard from '../ui/jobListCard';

const JobList = ({ filters, handleChange }: JobListProps) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<null | Job>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Fetching jobs from API...');
      const response = await fetch('/api/jobs');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Jobs API response:', data);
      console.log('Jobs array:', data.jobs);
      console.log('Total count:', data.total);

      setJobs(data.jobs || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);


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
    if (filters.locations.length) active.push(...filters.locations.map(loc => ({ key: 'locations', value: loc.value, label: `Location: ${loc.label}` })));
    if (filters.jobType) active.push({ key: 'jobType', value: filters.jobType, label: `Job Type: ${filters.jobType}` });
    if (filters.companySize) active.push({ key: 'companySize', value: filters.companySize, label: `Company Size: ${filters.companySize}` });
    if (filters.salaryRange) active.push({ key: 'salaryRange', value: filters.salaryRange, label: `Salary: $${filters.salaryRange[0]}k - $${filters.salaryRange[1]}k` });
    return active;
  };

  const handleRemoveFilter = (filter: any) => {
    if (filter.key === 'locations') {
      handleChange('locations', filters.locations.filter(loc => loc.value !== filter.value));
    } else if (filter.key === 'jobType') {
      handleChange('jobType', '');
    } else if (filter.key === 'companySize') {
      handleChange('companySize', '');
    } else if (filter.key === 'salaryRange') {
      handleChange('salaryRange', null);
    }
  };


  const activeFilters = getActiveFilters();

  return (
    <div className="px-[15px] pb-10 pt-6 sm:pb-[50px] sm:pt-[30px]">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 sm:gap-7">
        {/* Job count and filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {jobs.length > 0 ? `${jobs.length} jobs found` : (loading ? 'Loading jobs...' : 'No jobs found')}
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
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-10"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading jobs...</p>
            </div>
          </div>
        )}

        {/* Jobs Grid */}
        {!loading && jobs.length > 0 && (
          <>
            <div className="grid gap-5 gap-y-[30px] sm:gap-y-[50px] md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((item) => (
                <JobListCard key={item.id} item={item} onClick={handleCardClick} />
              ))}
            </div>

          </>
        )}

        {/* No jobs found */}
        {!loading && jobs.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 text-lg">No jobs found</p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Try adjusting your filters</p>
            </div>
          </div>
        )}
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
