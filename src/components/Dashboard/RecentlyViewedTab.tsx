import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/utils/supabase';
import toast from 'react-hot-toast';
import type { Job } from '@/types/JobTypes';
import JobListCard from '@/components/ui/jobListCard';

const RecentlyViewedTab: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<(Job & { viewedDate: string })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchViewedJobs = useCallback(async (showLoading = true) => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    if (showLoading) setLoading(true);
    try {
      const { data, error } = await supabase
        .from('job_views')
        .select('viewed_at, jobs(*)')
        .eq('user_id', user.id)
        .order('viewed_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const formatted:any =
        data?.map(item => ({
          ...item.jobs,
          viewedDate: item.viewed_at,
        })) || [];

      setJobs(formatted);
    } catch (error) {
      console.error('Error fetching viewed jobs:', error);
      toast.error('Failed to fetch viewed jobs');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [user?.id]);

  const handleSaveJob = useCallback(async (jobId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('saved_jobs').insert({
        user_id: user.id,
        job_id: jobId,
      });

      if (error && error.code !== '23505') throw error;

      toast.success('Job saved successfully 🎉');
      window.dispatchEvent(new CustomEvent('statsRefresh'));
      window.dispatchEvent(new CustomEvent('jobSaved', { detail: { jobId } }));
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error('Failed to save job');
    }
  }, [user]);

  const handleHideJob = useCallback(async (jobId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('hidden_jobs').insert({
        user_id: user.id,
        job_id: jobId,
      });

      if (error && error.code !== '23505') throw error;

      setJobs(prev => prev.filter(job => job.id !== jobId));
      toast.success('Job hidden successfully');
      window.dispatchEvent(new CustomEvent('statsRefresh'));
      window.dispatchEvent(new CustomEvent('jobHidden', { detail: { jobId } }));
    } catch (error) {
      console.error('Error hiding job:', error);
      toast.error('Failed to hide job');
    }
  }, [user]);

  const handleClearHistory = useCallback(async () => {
    if (!user) return;
    try {
      const { error } = await supabase.from('job_views').delete().eq('user_id', user.id);
      if (error) throw error;
      setJobs([]);
      toast.success('View history cleared');
    } catch (error) {
      console.error('Error clearing history:', error);
      toast.error('Failed to clear history');
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchViewedJobs();
    else setLoading(false);
  }, [fetchViewedJobs, user]);

  useEffect(() => {
    const handleRefresh = () => fetchViewedJobs(false);
    const handleJobViewed = () => fetchViewedJobs(false);
    const handleTabChange = (event: CustomEvent) => {
      if (event.detail?.tab === 'viewed') fetchViewedJobs(false);
    };

    window.addEventListener('statsRefresh', handleRefresh);
    window.addEventListener('jobViewed', handleJobViewed);
    window.addEventListener('tabChanged', handleTabChange as EventListener);

    return () => {
      window.removeEventListener('statsRefresh', handleRefresh);
      window.removeEventListener('jobViewed', handleJobViewed);
      window.removeEventListener('tabChanged', handleTabChange as EventListener);
    };
  }, [fetchViewedJobs]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-10"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading viewed jobs...</p>
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No Viewed Jobs</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
          Jobs you view will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between mb-8 gap-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recently Viewed</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Jobs you've viewed recently ({jobs.length})
          </p>
        </div>
        <button
          onClick={handleClearHistory}
          className="px-4 py-2 bg-primary-10 text-white text-sm font-medium rounded-md hover:bg-primary-15 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-10 focus:ring-offset-2 dark:focus:ring-offset-dark-20"
        >
          Clear History
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {jobs.map(job => (
          <div key={job.id} className="relative group transition-all duration-200 hover:scale-[1.01]">
            <JobListCard item={job} onClick={() => {}} />

            <div className="mt-3 p-3 bg-primary-10/5 dark:bg-primary-10/15 rounded-lg border border-primary-10/20 dark:border-primary-10/30 transition-colors">
              <p className="text-xs text-primary-15 dark:text-primary-10 text-center">
                Viewed{' '}
                {Math.max(
                  Math.floor((Date.now() - new Date(job.viewedDate).getTime()) / (1000 * 60 * 60)),
                  0
                )}{' '}
                hours ago
              </p>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleSaveJob(job.id)}
                  className="flex-1 px-3 py-1.5 bg-primary-10 text-white rounded-md text-xs font-medium hover:bg-primary-15 transition-all focus:outline-none focus:ring-2 focus:ring-primary-10"
                >
                  Save
                </button>
                <button
                  onClick={() => handleHideJob(job.id)}
                  className="flex-1 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-xs font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Hide
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentlyViewedTab;
