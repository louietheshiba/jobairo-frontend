'use client';
import React, { useState, useEffect, useCallback } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
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

  const [jobs, setJobs] = useState<Job[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [totalJobs, setTotalJobs] = useState(0);

  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const [viewedJobIds, setViewedJobIds] = useState<string[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const limit = 20;

  const getDateFilterISO = (label: string) => {
    const now = new Date();
    let days = 0;
    switch (label) {
      case '24hrs': days = 1; break;
      case '2 days': days = 2; break;
      case '4 days': days = 4; break;
      case '7 days': days = 7; break;
      case '30 days': days = 30; break;
      case '60 days': days = 60; break;
      case '90 days': days = 90; break;
      default: return null;
    }
    const fromDate = new Date(now.setDate(now.getDate() - days));
    return fromDate.toISOString();
  };

  const fetchJobs = useCallback(
    async (loadMore = false) => {
      try {
        const from = loadMore ? page * limit : 0;
        const to = from + limit - 1;

        let query = supabase
          .from('jobs')
          .select(`
            *,
            companies!inner (
              id,
              name
            )
          `, { count: 'exact' })
          .eq('status', 'open');

        if (filters.position?.trim())
          query = query.ilike('title', `%${filters.position}%`);

        if (filters.jobType)
          query = query.eq('employment_type', filters.jobType);

        if (filters.company)
          query = query.ilike('companies.name', `%${filters.company}%`);

        if (filters.locations?.length > 0 && filters.locations[0]?.value)
          query = query.ilike('location', `%${filters.locations[0].value}%`);

        if (filters.workSchedule?.length > 0 && filters.workSchedule[0]?.value)
          query = query.ilike('remote_type', `%${filters.workSchedule[0].value}%`);

        if (filters.education)
          query = query.eq('education', filters.education);

        if (filters.experienceLevel)
          query = query.eq('experience_level', filters.experienceLevel);

        if (filters.salaryRange && Array.isArray(filters.salaryRange)) {
          const [min, max] = filters.salaryRange;
          if (min && max) {
            query = query.or(`salary.ilike.%${min.toString().slice(0, 3)}%,salary.ilike.%${max.toString().slice(0, 3)}%`);
          } else if (min) {
            query = query.ilike('salary', `%${min.toString().slice(0, 3)}%`);
          } else if (max) {
            query = query.ilike('salary', `%${max.toString().slice(0, 3)}%`);
          }
        }


        if (filters.datePosted && filters.datePosted !== 'Date Posted') {
          const fromDate = getDateFilterISO(filters.datePosted);
          if (fromDate) query = query.gte('created_at', fromDate);
        }

        if (filters.relevance === 'Most Recent')
          query = query.order('created_at', { ascending: false });
        else if (filters.relevance === 'Oldest')
          query = query.order('created_at', { ascending: true });

        query = query.range(from, to);

        const { data, count, error } = await query;
        if (error) throw error;

        if (!loadMore) setJobs(data || []);
        else setJobs(prev => [...prev, ...(data || [])]);

        setTotalJobs(count || 0);
        setHasMore((from + limit) < (count || 0));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setLoading(false);
      }
    },
    [filters, page]
  );

  useEffect(() => {
    if (!user) return;
    const fetchUserJobs = async () => {
      const [saved, applied, viewed] = await Promise.all([
        supabase.from('saved_jobs').select('job_id').eq('user_id', user.id),
        supabase.from('applied_jobs').select('job_id').eq('user_id', user.id),
        supabase.from('job_views').select('job_id').eq('user_id', user.id),
      ]);

      if (saved.data) setSavedJobIds(saved.data.map(j => j.job_id));
      if (applied.data) setAppliedJobIds(applied.data.map(j => j.job_id));
      if (viewed.data) setViewedJobIds(viewed.data.map(j => j.job_id));
    };
    fetchUserJobs();
  }, [user]);

  const filteredJobs = jobs.filter(job => {
    if (filters.markedJobs.includes('Exclude Saved jobs') && savedJobIds.includes(job.id))
      return false;
    if (filters.markedJobs.includes('Exclude applied jobs') && appliedJobIds.includes(job.id))
      return false;
    if (filters.markedJobs.includes('Exclude viewed jobs') && viewedJobIds.includes(job.id))
      return false;
    return true;
  });

  const loadMore = () => setPage(p => p + 1);

  useEffect(() => {
    setLoading(true);
    setPage(0);
    fetchJobs(false);
  }, [filters]);

  useEffect(() => {
    if (page > 0) fetchJobs(true);
  }, [page]);

  const handleCardClick = (job: Job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
  };

  return (
    <div className="px-[15px] pb-5 pt-3 sm:pb-[20px] sm:pt-[15px]">
      <div className="mx-auto w-full max-w-[1200px] flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              {loading ? 'Loading jobs...' : `${filteredJobs.length} of ${totalJobs} open jobs`}
            </h2>
          </div>

          <div className="flex items-center gap-1">
            <FilterDropDownbutton
              id="relevance"
              iconColor={isDarkMode ? 'white' : '#666'}
              className="!font-medium text-sm dark:text-white"
              options={RELEVANCE_LIST.filter(({ label }) => label !== 'Relevance')}
              value={filters.relevance}
              onChange={val => handleChange('relevance', val)}
            >
              Relevance
            </FilterDropDownbutton>

            <FilterDropDownbutton
              id="datePosted"
              iconColor={isDarkMode ? 'white' : '#666'}
              className="!font-medium text-sm dark:text-white"
              options={DATE_POSTED_LIST.filter(({ label }) => label !== 'Date Posted')}
              value={filters.datePosted}
              onChange={val => handleChange('datePosted', val)}
            >
              Date Posted
            </FilterDropDownbutton>

            <FilterDropDownbutton
              id="markedJobs"
              iconColor={isDarkMode ? 'white' : '#666'}
              className="!font-medium text-sm dark:text-white"
              options={MARK_JOBS_LIST}
              isMulti
              value={filters.markedJobs}
              onChange={val => handleChange('markedJobs', val)}
            >
              Marked Jobs
            </FilterDropDownbutton>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-b-green-500"></div>
          </div>
        ) : filteredJobs.length > 0 ? (
          <InfiniteScroll
            dataLength={filteredJobs.length}
            next={loadMore}
            hasMore={hasMore}
            loader={
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-b-[#10b981]"></div>
              </div>
            }
            endMessage={
              <div className="text-center py-4 text-gray-500 text-sm">
                All open jobs loaded ({totalJobs} total)
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(380px,1fr))] gap-4 mt-4">
              {filteredJobs.map(job => (
                <JobListCard
                  key={job.id}
                  item={job}
                  onClick={handleCardClick}
                  isSaved={savedJobIds.includes(job.id)}
                />
              ))}
            </div>
          </InfiniteScroll>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No open jobs found for selected filters
          </div>
        )}
      </div>

      <JobDetailsModal isOpen={isModalOpen} onClose={handleCloseModal} job={selectedJob} />
    </div>
  );
};

export default JobList;
