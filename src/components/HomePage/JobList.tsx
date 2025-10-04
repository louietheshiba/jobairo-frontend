import React, { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/utils/supabase';
import type { Job, JobListProps } from '@/types/JobTypes';
import JobDetailsModal from '../Modals/JobDetail';
import JobListCard from '../ui/jobListCard';

const JobList = ({ filters, handleChange }: JobListProps) => {
  const { user } = useAuth();
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<null | Job>(null);

  const fetchAllJobs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/jobs');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      setAllJobs(data.jobs || []);
      setJobs(data.jobs || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setAllJobs([]);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter jobs locally based on search and other filters
  const filterJobs = useCallback(() => {
    let filtered = [...allJobs];

    // Search filter (client-side)
    if (filters.position) {
      const searchTerm = filters.position.toLowerCase();
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm) ||
        job.description.toLowerCase().includes(searchTerm)
      );
    }

    // Other filters (client-side for now)
    if (filters.locations.length > 0) {
      const locationValues = filters.locations.map(loc => loc.value.toLowerCase());
      filtered = filtered.filter(job =>
        locationValues.some(loc => job.location?.toLowerCase().includes(loc))
      );
    }

    if (filters.jobType) {
      filtered = filtered.filter(job =>
        job.employment_type?.toLowerCase() === filters.jobType.toLowerCase()
      );
    }

    if (filters.company) {
      filtered = filtered.filter(job =>
        job.company?.name?.toLowerCase().includes(filters.company.toLowerCase())
      );
    }

    

    setJobs(filtered);
  }, [allJobs, filters]);

  useEffect(() => {
    fetchAllJobs();
  }, [fetchAllJobs]);

  useEffect(() => {
    if (user) {
      const fetchSavedJobs = async () => {
        const { data, error } = await supabase
          .from('saved_jobs')
          .select('job_id')
          .eq('user_id', user.id);

        if (!error && data) {
          setSavedJobIds(data.map(s => s.job_id));
        }
      };
      fetchSavedJobs();
    }
  }, [user]);

  useEffect(() => {
    if (allJobs.length > 0) {
      filterJobs();
    }
  }, [filterJobs]);


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
    if (filters.company) active.push({ key: 'company', value: filters.company, label: `Company: ${filters.company}` });
    return active;
  };

  const handleRemoveFilter = (filter: any) => {
    if (filter.key === 'locations') {
      handleChange('locations', filters.locations.filter(loc => loc.value !== filter.value));
    } else if (filter.key === 'jobType') {
      handleChange('jobType', '');
    } else if (filter.key === 'company') {
      handleChange('company', '');
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
              {loading ? 'Loading jobs...' : `${jobs.length} jobs found`}
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
                <JobListCard key={item.id} item={item} onClick={handleCardClick} isSaved={savedJobIds.includes(item.id)} />
              ))}
            </div>

          </>
        )}

        {/* No jobs found */}
        {!loading && jobs.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {filters.position ? `No jobs found for '${filters.position}'` : 'No jobs found'}
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                {filters.position ? 'Try different keywords or adjust your filters' : 'Try adjusting your filters'}
              </p>
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
