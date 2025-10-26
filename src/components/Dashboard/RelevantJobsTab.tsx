import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/utils/supabase';
import JobListCard from '@/components/ui/jobListCard';
import type { Job } from '@/types/JobTypes';
import toast from 'react-hot-toast';
import { activityTracker } from '@/utils/activityTracker';

interface RelevantJobsTabProps {
  jobs?: Job[];
  onCardClick: (job: Job) => void;
}

const CACHE_KEY = 'relevantJobsCache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const RelevantJobsTab: React.FC<RelevantJobsTabProps> = ({ jobs: initialJobs, onCardClick }) => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>(initialJobs || []);
  const [personalized, setPersonalized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ Load from cache first for instant render
  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, ts } = JSON.parse(cached);
      if (Date.now() - ts < CACHE_TTL) {
        setJobs(data);
        setPersonalized(true);
        setLoading(false);
        console.log('Loaded jobs from cache');
      }
    }
  }, []);

  // ✅ Core fetch function — fast + parallel
  const fetchRelevantJobs = useCallback(
    async (showRefreshIndicator = false) => {
      if (!user) return;

      showRefreshIndicator ? setRefreshing(true) : setLoading(true);

      try {
        // 🔹 Fetch everything in parallel
        const [jobsRes, appliedRes, hiddenRes] = await Promise.all([
          fetch('/api/jobs?limit=100'),
          supabase.from('applied_jobs').select('job_id').eq('user_id', user.id),
          supabase.from('hidden_jobs').select('job_id').eq('user_id', user.id),
        ]);

        if (!jobsRes.ok) throw new Error('Failed to fetch jobs');

        const { jobs: allJobs = [] } = await jobsRes.json();

        // 🔹 Handle applied & hidden IDs
        const appliedIds = new Set((appliedRes.data || []).map((a: any) => a.job_id));
        const hiddenIds = new Set((hiddenRes.data || []).map((h: any) => h.job_id));

        // 🔹 Generate client-side recommendations
        let recommendedJobs = activityTracker.getRecommendedJobs(allJobs).filter(
          job => !appliedIds.has(job.id) && !hiddenIds.has(job.id)
        );

        // 🔹 Display personalized or fallback results
        if (recommendedJobs.length > 0) {
          setJobs(recommendedJobs);
          setPersonalized(true);
          localStorage.setItem(CACHE_KEY, JSON.stringify({ data: recommendedJobs, ts: Date.now() }));
          if (showRefreshIndicator) toast.success('Recommendations refreshed! 🎯');
        } else {
          const fallback = allJobs.slice(0, 10);
          setJobs(fallback);
          setPersonalized(false);
          if (showRefreshIndicator)
            toast('Showing popular jobs — interact to personalize!', { icon: '✨' });
        }
      } catch (error) {
        console.error('Error fetching relevant jobs:', error);
        toast.error('Failed to load recommendations');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user]
  );

  // ✅ Fetch when component mounts
  useEffect(() => {
    if (!initialJobs || initialJobs.length === 0) {
      const timer = setTimeout(() => fetchRelevantJobs(), 200);
      return () => clearTimeout(timer);
    }
  }, [user?.id, initialJobs, fetchRelevantJobs]);

  // ✅ Listen for tab change (to refresh)
  useEffect(() => {
    const handleTabChange = (e: CustomEvent) => {
      if (e.detail?.tab === 'relevant') fetchRelevantJobs(false);
    };
    window.addEventListener('tabChanged', handleTabChange as EventListener);
    return () => window.removeEventListener('tabChanged', handleTabChange as EventListener);
  }, [fetchRelevantJobs]);

  // ✅ Auto-refresh when activity changes
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handler = () => {
      if (loading || refreshing) return;
      clearTimeout(timeout);
      timeout = setTimeout(() => fetchRelevantJobs(), 2000);
    };
    window.addEventListener('relevantJobsRefresh', handler);
    return () => {
      window.removeEventListener('relevantJobsRefresh', handler);
      clearTimeout(timeout);
    };
  }, [loading, refreshing, fetchRelevantJobs]);

  // ✅ Realtime job action filtering
  useEffect(() => {
    const handleJobAction = (e: CustomEvent) => {
      const { jobId } = e.detail;
      if (jobId) setJobs(prev => prev.filter(job => job.id !== jobId));
    };
    ['jobSaved', 'jobApplied', 'jobHidden'].forEach(evt =>
      window.addEventListener(evt, handleJobAction as EventListener)
    );
    return () => {
      ['jobSaved', 'jobApplied', 'jobHidden'].forEach(evt =>
        window.removeEventListener(evt, handleJobAction as EventListener)
      );
    };
  }, []);

  const getReason = (i: number) => {
    const reasons = [
      'Based on your saved jobs and interests',
      'Similar to jobs you viewed recently',
      'Popular in your preferred locations',
      'Matching your skills and job type',
      'Trending in your industry',
    ];
    return reasons[i % reasons.length];
  };

  // ✅ UI Rendering
  if (loading)
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-b-2 border-[#10b981] rounded-full" />
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading recommendations...</span>
      </div>
    );

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recommended Jobs</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Personalized job recommendations based on your preferences
          </p>
          {personalized === false && (
            <div className="mt-2 inline-flex items-center gap-2 text-sm text-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-lg">
              <svg
                className="w-4 h-4 text-yellow-700 dark:text-yellow-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01M21 12A9 9 0 1112 3a9 9 0 019 9z"
                />
              </svg>
              <span>Showing recent jobs — start saving or applying to personalize!</span>
            </div>
          )}
        </div>
        <button
          onClick={() => fetchRelevantJobs(true)}
          disabled={refreshing}
          className="inline-flex items-center px-4 py-2 bg-[#10b981] text-white text-sm font-medium rounded-[10px] shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:ring-offset-2 disabled:opacity-50"
        >
          {refreshing ? (
            <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full mr-2" />
          ) : (
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          )}
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Jobs Grid */}
      {jobs.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No recommendations yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Update your preferences in settings to get personalized recommendations.
          </p>
          <button
            onClick={() => (window.location.href = '/')}
            className="px-4 py-2 bg-[#10b981] text-white rounded-[10px] shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] hover:-translate-y-1 transition-all duration-300"
          >
            Update Preferences
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {jobs.map((job, i) => (
            <div key={job.id} className="relative">
              <JobListCard item={job} onClick={onCardClick} />
              <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs text-blue-700 dark:text-blue-300">💡 {getReason(i)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RelevantJobsTab;
