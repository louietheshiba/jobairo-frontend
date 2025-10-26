import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/utils/supabase';
import type { Job } from '@/types/JobTypes';

interface AppliedJobsTabProps {
  onCardClick: (job: Job) => void;
}

const AppliedJobsTab: React.FC<AppliedJobsTabProps> = ({ onCardClick }) => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<(Job & { appliedDate: string; status: string })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppliedJobs = useCallback(async (showLoading = true) => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    if (showLoading) setLoading(true);
    try {
      // 👇 Single optimized query (join applied_jobs with jobs)
      const { data, error } = await supabase
        .from('applied_jobs')
        .select('created_at, jobs(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedJobs:any =
        data?.map((item) => ({
          ...item.jobs,
          appliedDate: item.created_at,
          status: 'Applied',
        })) || [];

      setJobs(formattedJobs);
    } catch (error) {
      console.error('Error fetching applied jobs:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [user?.id]);

  // Initial load
  useEffect(() => {
    if (user) fetchAppliedJobs();
    else setLoading(false);
  }, [fetchAppliedJobs, user]);

  // Refresh listeners for other components (stats, apply actions, tab switch)
  useEffect(() => {
    const handleRefresh = () => fetchAppliedJobs(false);
    const handleJobApplied = () => fetchAppliedJobs(false);
    const handleTabChange = (event: CustomEvent) => {
      if (event.detail?.tab === 'applied') fetchAppliedJobs(false);
    };

    window.addEventListener('statsRefresh', handleRefresh);
    window.addEventListener('jobApplied', handleJobApplied);
    window.addEventListener('tabChanged', handleTabChange as EventListener);

    return () => {
      window.removeEventListener('statsRefresh', handleRefresh);
      window.removeEventListener('jobApplied', handleJobApplied);
      window.removeEventListener('tabChanged', handleTabChange as EventListener);
    };
  }, [fetchAppliedJobs]);

  // 🔄 Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-10"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading applied jobs...</p>
        </div>
      </div>
    );
  }

  // 📭 Empty state
  if (!jobs.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">
          You haven’t applied for any jobs yet.
        </p>
      </div>
    );
  }

  // ✅ Main render
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Applied Jobs</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your job applications ({jobs.length})
          </p>
        </div>
      </div>

      {/* Timeline / Cards */}
      <div className="space-y-6">
        {jobs.map((job, index) => (
          <div key={job.id} className="relative group transition-transform duration-150 hover:scale-[1.01]">
            {/* Timeline line */}
            {index < jobs.length - 1 && (
              <div className="absolute left-6 top-14 w-0.5 h-16 bg-gray-300 dark:bg-gray-700" />
            )}

            <div className="flex items-start gap-4">
              {/* Timeline number */}
              <div className="flex-shrink-0 w-12 h-12 bg-primary-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                {index + 1}
              </div>

              {/* Job card */}
              <div className="flex-1 bg-white dark:bg-dark-20 rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                      {job.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {job.company?.name ?? 'Unknown Company'} • {job.salary_range ?? 'N/A'}
                    </p>
                  </div>

                  {/* Status badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      job.status === 'Applied'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {job.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>
                    Applied on{' '}
                    {new Date(job.appliedDate).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <button
                    onClick={() => onCardClick(job)}
                    className="text-primary-10 hover:text-primary-15 font-medium transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppliedJobsTab;
