import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/utils/supabase';
import toast from 'react-hot-toast';
import type { Job } from '@/types/JobTypes';
const HiddenJobsTab: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<(Job & { hiddenDate: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchHiddenJobs = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('hidden_jobs')
          .select('job_id, created_at')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching hidden jobs:', error);
          return;
        }

        const jobIds = data.map(s => s.job_id);
        if (jobIds.length === 0) {
          setJobs([]);
          setLoading(false);
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
          const hidden = data.find(s => s.job_id === job.id);
          return { ...job, hiddenDate: hidden?.created_at || '' };
        });

        setJobs(jobsWithDate);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHiddenJobs();
  }, [user]);

  const handleUnhide = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('hidden_jobs')
        .delete()
        .eq('user_id', user?.id)
        .eq('job_id', jobId);

      if (error) throw error;

      setJobs(jobs.filter(j => j.id !== jobId));
      toast.success('Job unhidden');
    } catch (error) {
      console.error('Error unhiding job:', error);
      toast.error('Failed to unhide job');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-10"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading hidden jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Hidden Jobs</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Jobs you've hidden from recommendations ({jobs.length})
          </p>
        </div>
        {jobs.length > 0 && (
          <button className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
            Unhide All
          </button>
        )}
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 text-lg">No hidden jobs yet</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Hidden jobs will appear here</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white dark:bg-dark-20 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{job.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{job.company?.name} • {job.employment_type} • {job.salary_range}</p>
                  <div className="inline-flex items-center px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs rounded-full">
                    Hidden on {new Date(job.hiddenDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => handleUnhide(job.id)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Unhide
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          <strong>Note:</strong> Hidden jobs will be automatically deleted after 30 days.
        </p>
      </div>
    </div>
  );
};

export default HiddenJobsTab;