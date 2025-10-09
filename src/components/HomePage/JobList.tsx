import React, { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/utils/supabase';
import { useTheme } from '@/context/useTheme';
import type { Job, JobListProps } from '@/types/JobTypes';
import {
  DATE_POSTED_LIST,
  MARK_JOBS_LIST,
  RELEVANCE_LIST,
} from '@/utils/constant';

import JobDetailsModal from '../Modals/JobDetail';
import { FilterDropDownbutton } from '../ui/filterDropDownbutton';
import JobListCard from '../ui/jobListCard';

const JobList = ({ filters, handleChange }: JobListProps) => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const [viewedJobIds, setViewedJobIds] = useState<string[]>([]);
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

    // Date posted filter
    if (filters.datePosted && filters.datePosted !== 'Date Posted') {
      const now = new Date();
      let daysAgo;
      switch (filters.datePosted) {
        case '24hrs':
          daysAgo = 1;
          break;
        case '2 days':
          daysAgo = 2;
          break;
        case '4 days':
          daysAgo = 4;
          break;
        case '7 days':
          daysAgo = 7;
          break;
        case '30 days':
          daysAgo = 30;
          break;
        case '60 days':
          daysAgo = 60;
          break;
        case '90 days':
          daysAgo = 90;
          break;
        default:
          daysAgo = 0;
      }
      const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(job => {
        const postedDate = new Date(job.date_posted || job.created_at);
        return postedDate >= cutoffDate;
      });
    }

    // Marked jobs filter (exclude)
    if (filters.markedJobs.length > 0) {
      filtered = filtered.filter(job => {
        if (filters.markedJobs.includes('Exclude Saved jobs') && savedJobIds.includes(job.id)) {
          return false;
        }
        if (filters.markedJobs.includes('Exclude applied jobs') && appliedJobIds.includes(job.id)) {
          return false;
        }
        if (filters.markedJobs.includes('Exclude viewed jobs') && viewedJobIds.includes(job.id)) {
          return false;
        }
        return true;
      });
    }

    // Relevance sorting
    if (filters.relevance && filters.relevance !== 'Relevance') {
      switch (filters.relevance) {
        case 'Most Recent':
          filtered.sort((a, b) => new Date(b.date_posted || b.created_at).getTime() - new Date(a.date_posted || a.created_at).getTime());
          break;
        case 'Oldest':
          filtered.sort((a, b) => new Date(a.date_posted || a.created_at).getTime() - new Date(b.date_posted || b.created_at).getTime());
          break;
        case 'Highest Salary':
          filtered.sort((a, b) => {
            const aSalary = parseInt(a.salary_range?.replace(/[^0-9]/g, '') || '0');
            const bSalary = parseInt(b.salary_range?.replace(/[^0-9]/g, '') || '0');
            return bSalary - aSalary;
          });
          break;
        case 'Least Experience':
          // Assuming experience level from title or description, but for simplicity, sort by title length or something
          // This might need more logic, but for now, sort by title alphabetically
          filtered.sort((a, b) => a.title.localeCompare(b.title));
          break;
        default:
          break;
      }
    }

    setJobs(filtered);
  }, [allJobs, filters, savedJobIds, appliedJobIds, viewedJobIds]);

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

      const fetchAppliedJobs = async () => {
        const { data, error } = await supabase
          .from('applied_jobs')
          .select('job_id')
          .eq('user_id', user.id);

        if (!error && data) {
          setAppliedJobIds(data.map(a => a.job_id));
        }
      };

      const fetchViewedJobs = async () => {
        const { data, error } = await supabase
          .from('job_views')
          .select('job_id')
          .eq('user_id', user.id);

        if (!error && data) {
          setViewedJobIds(data.map(v => v.job_id));
        }
      };

      fetchSavedJobs();
      fetchAppliedJobs();
      fetchViewedJobs();
    }
  }, [user]);

  useEffect(() => {
    if (allJobs.length > 0) {
      filterJobs();
    }
  }, [filterJobs, savedJobIds, appliedJobIds, viewedJobIds]);


  const handleCardClick = (job: Job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleSaveJob = (jobId: string, isSaved: boolean) => {
    if (isSaved) {
      setSavedJobIds(prev => [...prev, jobId]);
    } else {
      setSavedJobIds(prev => prev.filter(id => id !== jobId));
    }
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
                    className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#00d4aa] to-[#00b894] px-3 py-1 text-sm text-white shadow-[0_2px_8px_rgba(0,212,170,0.2)]"
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


        <div className="flex items-center sm:gap-7 mb-4">
          <FilterDropDownbutton
            id="relevance"
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
            Relevance
          </FilterDropDownbutton>

          <FilterDropDownbutton
            id="datePosted"
            iconColor={isDarkMode ? 'white' : '#666666'}
            className="!gap-1.5 !font-semibold text-themeGray-15 dark:text-white"
            options={DATE_POSTED_LIST?.filter(
              ({ label }) => label !== 'Date Posted'
            )}
            value={filters?.datePosted}
            onChange={(val) => {
              handleChange('datePosted', `${val}`);
            }}
          >
            Date Posted
          </FilterDropDownbutton>

          <FilterDropDownbutton
            id="markedJobs"
            iconColor={isDarkMode ? 'white' : '#666666'}
            className="!gap-1.5 !font-semibold text-themeGray-15 dark:text-white"
            options={MARK_JOBS_LIST}
            isMulti
            value={filters?.markedJobs}
            onChange={(val) => {
              handleChange('markedJobs', val);
            }}
          >
            Marked Jobs
          </FilterDropDownbutton>
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
          <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(380px,1fr))] gap-6">
            {jobs.map((item) => (
              <JobListCard key={item.id} item={item} onClick={handleCardClick} isSaved={savedJobIds.includes(item.id)} onSave={handleSaveJob} />
            ))}
          </div>
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
