import React, { useState, useEffect } from 'react';
import JobListCard from '@/components/ui/jobListCard';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/utils/supabase';
import type { Job } from '@/types/JobTypes';

interface SavedJobsTabProps {
  onCardClick: (job: Job) => void;
}

const SavedJobsTab: React.FC<SavedJobsTabProps> = ({ onCardClick }) => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<(Job & { savedDate: string })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedJobs = async (showLoading = true) => {
    if (!user) {
      setLoading(false);
      return;
    }

    if (showLoading) setLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_jobs')
        .select('job_id, created_at')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching saved jobs:', error);
        if (showLoading) setLoading(false);
        return;
      }

      const jobIds = data.map(s => s.job_id);
      if (jobIds.length === 0) {
        setJobs([]);
        if (showLoading) setLoading(false);
        return;
      }

      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .in('id', jobIds);

      if (jobsError) {
        console.error('Error fetching jobs:', jobsError);
        if (showLoading) setLoading(false);
        return;
      }

      const jobsWithDate = jobsData.map(job => {
        const saved = data.find(s => s.job_id === job.id);
        return { ...job, savedDate: saved?.created_at || '' };
      });

      setJobs(jobsWithDate);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSavedJobs();
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Listen for stats refresh events to update the list when jobs are saved/unsaved
    const handleRefresh = () => {
      if (user) {
        fetchSavedJobs(false); // Don't show loading for refresh updates
      }
    };

    window.addEventListener('statsRefresh', handleRefresh);

    return () => {
      window.removeEventListener('statsRefresh', handleRefresh);
    };
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-10"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading saved jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Saved Jobs</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Jobs you've saved for later ({jobs.length})
          </p>
        </div>

        
      </div>


      {jobs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 text-lg">No saved jobs yet</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Start saving jobs to see them here</p>
        </div>
      ) : (
        /* Jobs Grid */
  <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(380px,1fr))] gap-4 gap-y-[30px] sm:gap-y-[50px]">
          {jobs.map((job) => (
            <div key={job.id} className="relative">
              <JobListCard item={job} onClick={onCardClick} isSaved={true} />
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Saved on {new Date(job.savedDate).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default SavedJobsTab;