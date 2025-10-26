import React, { useState, useEffect, useCallback } from 'react';
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

  const fetchSavedJobs = useCallback(async (showLoading = true) => {
    if (!user) {
      setJobs([]);
      setLoading(false);
      return;
    }

    if (showLoading) setLoading(true);

    try {
      const { data: savedJobs, error: savedError } = await supabase
        .from('saved_jobs')
        .select('job_id, created_at')
        .eq('user_id', user.id);

      if (savedError) throw savedError;

      if (!savedJobs?.length) {
        setJobs([]);
        return;
      }
      const jobIds = savedJobs.map(({ job_id }) => job_id);
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .in('id', jobIds);

      if (jobsError) throw jobsError;
      const jobsWithDate = jobsData.map(job => ({
        ...job,
        savedDate:
          savedJobs.find(saved => saved.job_id === job.id)?.created_at || '',
      }));
      setJobs(
        jobsWithDate.sort(
          (a, b) =>
            new Date(b.savedDate).getTime() - new Date(a.savedDate).getTime()
        )
      );
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchSavedJobs();
    else setLoading(false);
  }, [user, fetchSavedJobs]);

  useEffect(() => {
    if (!user) return;

    const refreshHandler = () => fetchSavedJobs(false);
    const tabChangeHandler = (event: CustomEvent) => {
      if (event.detail?.tab === 'saved') fetchSavedJobs(false);
    };

    // Attach listeners
    window.addEventListener('statsRefresh', refreshHandler);
    window.addEventListener('jobSaved', refreshHandler);
    window.addEventListener('jobUnsaved', refreshHandler);
    window.addEventListener('tabChanged', tabChangeHandler as EventListener);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('statsRefresh', refreshHandler);
      window.removeEventListener('jobSaved', refreshHandler);
      window.removeEventListener('jobUnsaved', refreshHandler);
      window.removeEventListener('tabChanged', tabChangeHandler as EventListener);
    };
  }, [user, fetchSavedJobs]);

  /** Loading State */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-b-2 border-primary-10 rounded-full animate-spin" />
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Loading saved jobs...
          </p>
        </div>
      </div>
    );
  }

  /** Empty State */
  if (!jobs.length) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          No saved jobs yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
          Start saving jobs to see them here.
        </p>
      </div>
    );
  }

  /** Jobs List */
  return (
    <section className="fade-in">
      <div className="flex flex-wrap items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Saved Jobs
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Jobs you've saved for later ({jobs.length})
          </p>
        </div>
      </div>

      <div
        className="
          grid 
          grid-cols-1
          sm:grid-cols-2
          gap-6 
          animate-fadeIn
        "
      >
        {jobs.map(job => (
          <div
            key={job.id}
            className="relative group transition-transform duration-200 hover:scale-[1.02]"
          >
            <JobListCard
              item={job}
              onClick={onCardClick}
              isSaved={true}
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
              Saved on {new Date(job.savedDate).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SavedJobsTab;
