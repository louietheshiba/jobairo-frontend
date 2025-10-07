import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/utils/supabase';
import toast from 'react-hot-toast';
import type { Job } from '@/types/JobTypes';
import JobListCard from '@/components/ui/jobListCard';
const RecentlyViewedTab: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<(Job & { viewedDate: string })[]>([]);
  const [loading, setLoading] = useState(true);

  const handleSaveJob = async (jobId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('saved_jobs').insert({
        user_id: user.id,
        job_id: jobId,
      });

      if (error && error.code !== '23505') { // Ignore duplicate key error
        throw error;
      }

      toast.success('Job saved successfully! 🎉');
      // Trigger stats refresh
      window.dispatchEvent(new CustomEvent('statsRefresh'));
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error('Failed to save job');
    }
  };

  const handleHideJob = async (jobId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('hidden_jobs').insert({
        user_id: user.id,
        job_id: jobId,
      });

      if (error && error.code !== '23505') { // Ignore duplicate key error
        throw error;
      }

      // Remove from the list immediately for better UX
      setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
      toast.success('Job hidden from your view');
      // Trigger stats refresh for consistency
      window.dispatchEvent(new CustomEvent('statsRefresh'));
    } catch (error) {
      console.error('Error hiding job:', error);
      toast.error('Failed to hide job');
    }
  };

  const handleClearHistory = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('job_views')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setJobs([]);
      toast.success('View history cleared');
    } catch (error) {
      console.error('Error clearing history:', error);
      toast.error('Failed to clear history');
    }
  };

  const fetchViewedJobs = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('job_views')
        .select('job_id, viewed_at')
        .eq('user_id', user.id)
        .order('viewed_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching viewed jobs:', error);
        return;
      }

      const jobIds = data.map(s => s.job_id);
      if (jobIds.length === 0) {
        setJobs([]);
        return;
      }

      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .in('id', jobIds);

      if (jobsError) {
        console.error('Error fetching jobs:', jobsError);
        return;
      }

      const jobsWithDate = jobsData.map(job => {
        const viewed = data.find(s => s.job_id === job.id);
        return { ...job, viewedDate: viewed?.viewed_at || '' };
      });

      setJobs(jobsWithDate);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViewedJobs();
  }, [user]);

  useEffect(() => {
    // Listen for stats refresh events to update the list when jobs are hidden
    const handleRefresh = () => {
      fetchViewedJobs();
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
          <p className="text-gray-600 dark:text-gray-400">Loading viewed jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recently Viewed</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Jobs you've viewed recently ({jobs.length})
          </p>
        </div>
        {jobs.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={handleClearHistory}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Clear History
            </button>
          </div>
        )}
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 text-lg">No viewed jobs yet</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Jobs you view will appear here</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <div key={job.id} className="relative">
              <JobListCard
                item={job}
                onClick={() => {}} // Could open modal if needed
              />
              <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
                  Viewed {Math.floor((new Date().getTime() - new Date(job.viewedDate).getTime()) / (1000 * 60 * 60))} hours ago
                </p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleSaveJob(job.id)}
                    className="flex-1 px-2 py-1 bg-primary-10 text-white rounded text-xs hover:bg-primary-15 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => handleHideJob(job.id)}
                    className="flex-1 px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Hide
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentlyViewedTab;