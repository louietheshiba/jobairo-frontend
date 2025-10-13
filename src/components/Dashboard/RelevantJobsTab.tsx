import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import JobListCard from '@/components/ui/jobListCard';
import type { Job } from '@/types/JobTypes';
import toast from 'react-hot-toast';

interface RelevantJobsTabProps {
  jobs?: Job[]; // Made optional since we'll fetch our own
  onCardClick: (job: Job) => void;
}

const RelevantJobsTab: React.FC<RelevantJobsTabProps> = ({ jobs: initialJobs, onCardClick }) => {
   const { user, userRole } = useAuth();
  const [jobs, setJobs] = useState<Job[]>(initialJobs || []);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRelevantJobs = async (showRefreshIndicator = false) => {
    if (!user) return;

    if (showRefreshIndicator) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await fetch(`/api/jobs/relevant?userId=${user.id}`);
      const data = await response.json();

      if (response.ok) {
        setJobs(data.jobs || []);
        localStorage.setItem('lastRelevantJobsFetch', Date.now().toString());
        if (showRefreshIndicator) {
          toast.success('Recommendations refreshed! 🎯');
        }
      } else {
        console.error('Failed to fetch relevant jobs:', data.error);
        toast.error('Failed to load recommendations');
      }
    } catch (error) {
      console.error('Error fetching relevant jobs:', error);
      toast.error('Failed to load recommendations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Only fetch if we don't have initial jobs or if user changes
    if (!initialJobs || initialJobs.length === 0) {
      fetchRelevantJobs();
    }
  }, [user?.id, initialJobs]);

  // Refresh recommendations when user profile might have changed
  // This effect runs when the component becomes visible (tab is active)
  useEffect(() => {
    const lastFetchTime = localStorage.getItem('lastRelevantJobsFetch');
    const currentTime = Date.now();

    // Always refresh if no cache exists (preferences were updated) or cache is old
    const shouldRefresh = !lastFetchTime ||
      (currentTime - parseInt(lastFetchTime)) > 300000 || // 5 minutes
      jobs.length === 0; // No jobs loaded yet

    if (shouldRefresh) {
      console.log('Refreshing relevant jobs - cache cleared or expired');
      fetchRelevantJobs();
    }
  }, []);

  const handleRefresh = () => {
    fetchRelevantJobs(true);
  };

  const handleHideJob = async (jobId: string) => {
    if (!user) return;

    try {
      const response = await fetch('/api/jobs/hide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          jobId: jobId,
        }),
      });

      if (response.ok) {
        // Remove the job from the current list
        setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
        toast.success('Job hidden from recommendations');
      } else {
        toast.error('Failed to hide job');
      }
    } catch (error) {
      console.error('Error hiding job:', error);
      toast.error('Failed to hide job');
    }
  };

  const getRecommendationReason = (index: number) => {
    // This could be enhanced with more sophisticated logic based on user activity
    const reasons = [
      'Based on your saved jobs and preferences',
      'Matches your preferred job types',
      'Popular in your preferred locations',
      'Similar to jobs you\'ve viewed recently',
      'Recommended based on your experience level',
      'Trending in your industry'
    ];

    return reasons[index % reasons.length];
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-10"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading recommendations...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recommended Jobs</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Personalized job recommendations based on your preferences and activity
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#10b981] to-[#047857] text-white text-sm font-medium rounded-[10px] shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {refreshing ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
          {refreshing ? 'Refreshing...' : 'Refresh Recommendations'}
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No recommendations yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Update your job preferences in settings to get personalized recommendations
          </p>
          <button
            onClick={() => window.location.href = `${userRole === 'admin' ? '/admin/dashboard' : '/dashboard'}?tab=settings`}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#10b981] to-[#047857] text-white text-sm font-medium rounded-[10px] shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] hover:-translate-y-1 transition-all duration-300"
          >
            Update Preferences
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
            {jobs.map((job, index) => (
              <div key={job.id} className="relative">
                <JobListCard item={job} onClick={onCardClick} />
                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    💡 {getRecommendationReason(index)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-3">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
              Not Interested
            </button>
            <button
              onClick={() => jobs.length > 0 && jobs[0] && handleHideJob(jobs[0].id)}
              disabled={jobs.length === 0}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hide This Job
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default RelevantJobsTab;