import React, { useState, useEffect } from 'react';
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

  const fetchAppliedJobs = async (showLoading = true) => {
    if (!user) {
      setLoading(false);
      return;
    }

    if (showLoading) setLoading(true);
    try {
      const { data, error } = await supabase
        .from('applied_jobs')
        .select('job_id, created_at')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching applied jobs:', error);
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
        const applied = data.find(s => s.job_id === job.id);
        return { ...job, appliedDate: applied?.created_at || '', status: 'Applied' };
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
      fetchAppliedJobs();
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Listen for stats refresh events to update the list when jobs are applied/unapplied
    const handleRefresh = () => {
      if (user) {
        fetchAppliedJobs(false); // Don't show loading for refresh updates
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
          <p className="text-gray-600 dark:text-gray-400">Loading applied jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Applied Jobs</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your job applications ({jobs.length})
          </p>
        </div>

      </div>

      {/* Timeline View */}
      <div className="space-y-6">
        {jobs.map((job, index) => (
          <div key={job.id} className="relative">
            {/* Timeline line */}
            {index < jobs.length - 1 && (
              <div className="absolute left-6 top-16 w-0.5 h-16 bg-gray-300 dark:bg-gray-600"></div>
            )}

            <div className="flex items-start gap-4">
              {/* Timeline dot */}
              <div className="flex-shrink-0 w-12 h-12 bg-primary-10 rounded-full flex items-center justify-center text-white font-bold">
                {index + 1}
              </div>

              {/* Job Card */}
              <div className="flex-1 bg-white dark:bg-dark-20 rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {job.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {job.company?.name} • {job.salary_range}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${job.status === 'Applied'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : job.status === 'Interview'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                    {job.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Applied {new Date(job.appliedDate).toLocaleDateString()}</span>
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