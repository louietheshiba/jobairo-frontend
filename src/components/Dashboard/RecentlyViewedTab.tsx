import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/utils/supabase';
import toast from 'react-hot-toast';
import type { Job } from '@/types/JobTypes';
const RecentlyViewedTab: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<(Job & { viewedDate: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchViewedJobs = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('viewed_jobs')
          .select('job_id, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('Error fetching viewed jobs:', error);
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
          const viewed = data.find(s => s.job_id === job.id);
          return { ...job, viewedDate: viewed?.created_at || '' };
        });

        setJobs(jobsWithDate);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchViewedJobs();
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
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
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
        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white dark:bg-dark-20 rounded-lg shadow-sm p-4 opacity-60 hover:opacity-100 transition-opacity">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{job.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{job.company?.name} • {job.employment_type} • {job.salary_range}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Viewed {Math.floor((new Date().getTime() - new Date(job.viewedDate).getTime()) / (1000 * 60 * 60))} hours ago
                  </p>
                  <div className="flex gap-1 mt-1">
                    <button className="px-2 py-1 bg-primary-10 text-white rounded text-xs hover:bg-primary-15 transition-colors">
                      Save
                    </button>
                    <button className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                      Hide
                    </button>
                  </div>
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