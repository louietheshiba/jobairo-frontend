import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/utils/supabase';
import toast from 'react-hot-toast';
import type { Job } from '@/types/JobTypes';

const HiddenJobsTab: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<(Job & { hiddenDate: string })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHiddenJobs = useCallback(async (showLoading = true) => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    if (showLoading) setLoading(true);
    try {
      const { data, error } = await supabase
        .from('hidden_jobs')
        .select('created_at, jobs(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedJobs:any =
        data?.map(item => ({
          ...item.jobs,
          hiddenDate: item.created_at,
        })) || [];

      setJobs(formattedJobs);
    } catch (error) {
      console.error('Error fetching hidden jobs:', error);
      toast.error('Failed to fetch hidden jobs');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) fetchHiddenJobs();
    else setLoading(false);
  }, [fetchHiddenJobs, user]);

  useEffect(() => {
    const handleTabChange = (event: CustomEvent) => {
      if (event.detail?.tab === 'hidden') fetchHiddenJobs(false);
    };
    window.addEventListener('tabChanged', handleTabChange as EventListener);
    return () => window.removeEventListener('tabChanged', handleTabChange as EventListener);
  }, [fetchHiddenJobs]);

  const handleUnhide = useCallback(
    async (jobId: string) => {
      try {
        const { error } = await supabase
          .from('hidden_jobs')
          .delete()
          .eq('user_id', user?.id)
          .eq('job_id', jobId);

        if (error) throw error;
        setJobs(prev => prev.filter(j => j.id !== jobId));
        toast.success('Job unhidden');
        window.dispatchEvent(new CustomEvent('statsRefresh'));
      } catch (error) {
        console.error('Error unhiding job:', error);
        toast.error('Failed to unhide job');
      }
    },
    [user?.id]
  );

  const handleUnhideAll = useCallback(async () => {
    if (!user || jobs.length === 0) return;
    try {
      const jobIds = jobs.map(job => job.id);
      const { error } = await supabase
        .from('hidden_jobs')
        .delete()
        .eq('user_id', user.id)
        .in('job_id', jobIds);

      if (error) throw error;
      setJobs([]);
      toast.success(`Unhidden ${jobIds.length} jobs`);
      window.dispatchEvent(new CustomEvent('statsRefresh'));
    } catch (error) {
      console.error('Error unhiding all jobs:', error);
      toast.error('Failed to unhide all jobs');
    }
  }, [user, jobs]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-10"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading hidden jobs...</p>
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No Hidden Jobs</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
          Hidden jobs will appear here once you hide them.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between mb-8 gap-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Hidden Jobs</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Jobs you’ve hidden from recommendations ({jobs.length})
          </p>
        </div>
        <button
          onClick={handleUnhideAll}
          className="px-4 py-2 bg-primary-10 text-white text-sm font-medium rounded-md hover:bg-primary-15 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-10 focus:ring-offset-2 dark:focus:ring-offset-dark-20"
        >
          Unhide All
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {jobs.map(job => (
          <div
            key={job.id}
            className="bg-white dark:bg-[#282828] rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200 flex flex-col justify-between border border-gray-100 dark:border-white"
          >
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">
                {job.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 truncate">
                {job.company?.name ?? 'Unknown Company'} • {job.employment_type ?? 'N/A'} •{' '}
                {job.salary_range ?? 'N/A'}
              </p>
              <span className="inline-flex items-center px-2 py-1 bg-primary-10/10 dark:bg-primary-10/20 text-primary-15 dark:text-primary-10 text-xs rounded-full">
                Hidden on{' '}
                {new Date(job.hiddenDate).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => handleUnhide(job.id)}
                className="px-4 py-2 bg-primary-10 text-white text-sm font-medium rounded-md hover:bg-primary-15 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-10 focus:ring-offset-2 dark:focus:ring-offset-dark-20"
              >
                Unhide
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-100 dark:border-yellow-800">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          <strong>Note:</strong> Hidden jobs are automatically deleted after 30 days.
        </p>
      </div>
    </div>
  );
};

export default HiddenJobsTab;
