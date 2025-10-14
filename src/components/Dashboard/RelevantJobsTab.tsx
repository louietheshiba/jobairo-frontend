import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/utils/supabase';
import JobListCard from '@/components/ui/jobListCard';
import type { Job } from '@/types/JobTypes';
import toast from 'react-hot-toast';
import { activityTracker } from '@/utils/activityTracker';

interface RelevantJobsTabProps {
  jobs?: Job[]; // Made optional since we'll fetch our own
  onCardClick: (job: Job) => void;
}

const RelevantJobsTab: React.FC<RelevantJobsTabProps> = ({ jobs: initialJobs, onCardClick }) => {
   const { user, userRole } = useAuth();
  const [jobs, setJobs] = useState<Job[]>(initialJobs || []);
  const [personalized, setPersonalized] = useState<boolean | null>(null);
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
      // Use client-side recommendations only - much faster
      const allJobsResponse = await fetch('/api/jobs?limit=100'); // Limit to 100 jobs for performance
      if (allJobsResponse.ok) {
        const allJobsData = await allJobsResponse.json();
        const allJobs = allJobsData.jobs || [];

        // Get personalized recommendations based on user activity
        let recommendedJobs = activityTracker.getRecommendedJobs(allJobs);
  
        // Filter out jobs that user has already saved, applied, or hidden
        try {
          const [savedRes, appliedRes, hiddenRes] = await Promise.all([
            supabase.from('saved_jobs').select('job_id').eq('user_id', user.id),
            supabase.from('applied_jobs').select('job_id').eq('user_id', user.id),
            supabase.from('hidden_jobs').select('job_id').eq('user_id', user.id)
          ]);
  
          const savedJobIds = new Set((savedRes.data as any[])?.map((s: any) => s.job_id) || []);
          const appliedJobIds = new Set((appliedRes.data as any[])?.map((a: any) => a.job_id) || []);
          const hiddenJobIds = new Set((hiddenRes.data as any[])?.map((h: any) => h.job_id) || []);
  
          // Filter out jobs that are already saved, applied, or hidden
          recommendedJobs = recommendedJobs.filter(job =>
            !savedJobIds.has(job.id) &&
            !appliedJobIds.has(job.id) &&
            !hiddenJobIds.has(job.id)
          );
  
          console.log('Filtered recommended jobs:', recommendedJobs.length, 'from', allJobs.length, 'total jobs');
          console.log('Filtered out:', {
            saved: savedJobIds.size,
            applied: appliedJobIds.size,
            hidden: hiddenJobIds.size
          });
  
        } catch (error) {
          console.warn('Error filtering jobs:', error);
          // Continue with unfiltered recommendations if filtering fails
        }
  
        if (recommendedJobs.length > 0) {
          setJobs(recommendedJobs);
          setPersonalized(true);
          if (showRefreshIndicator) toast.success('Recommendations refreshed! 🎯');
        } else {
          // Show some recent jobs if no recommendations yet
          const recentJobs = allJobs.slice(0, 10);
          setJobs(recentJobs);
          setPersonalized(false);
          if (showRefreshIndicator) toast.success('Showing recent jobs - start interacting to get personalized recommendations!');
        }
      } else {
        // Fallback: show empty state
        setJobs([]);
        setPersonalized(null);
        toast.error('Failed to load jobs');
      }

      const ts = Date.now();
      localStorage.setItem('lastRelevantJobsFetch', ts.toString());
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
      // Delay fetch slightly to avoid blocking initial render
      const timer = setTimeout(() => fetchRelevantJobs(), 100);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [user?.id, initialJobs]);

  // Refresh recommendations when user profile might have changed
  // This effect runs when the component becomes visible (tab is active)
  useEffect(() => {
    // Only refresh if no jobs loaded yet, otherwise rely on manual refresh
    const shouldRefresh = jobs.length === 0;

    if (shouldRefresh) {
      console.log('Loading initial relevant jobs');
      const timer = setTimeout(() => fetchRelevantJobs(), 200);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, []);

  // Listen for external events that signal user activity changed and recommendations should refresh
  useEffect(() => {
    let timeout: any = null;
    const handler = () => {
      // debounce refreshes within 2s and only refresh if not already loading
      if (timeout) clearTimeout(timeout);
      if (loading || refreshing) return; // Don't refresh if already loading

      timeout = setTimeout(() => {
        console.log('Received relevantJobsRefresh event, updating recommendations');
        // Just update the jobs list without full fetch - much faster
        fetch('/api/jobs?limit=50').then(response => {
          if (response.ok) {
            response.json().then(data => {
              const allJobs = data.jobs || [];
              const recommendedJobs = activityTracker.getRecommendedJobs(allJobs);
              if (recommendedJobs.length > 0) {
                setJobs(recommendedJobs);
                setPersonalized(true);
              }
            });
          }
        }).catch(() => {});
      }, 2000); // Longer debounce to avoid too frequent updates
    };

    window.addEventListener('relevantJobsRefresh', handler);
    return () => {
      window.removeEventListener('relevantJobsRefresh', handler);
      if (timeout) clearTimeout(timeout);
    };
  }, [user?.id, loading, refreshing]);

  const handleRefresh = () => {
    fetchRelevantJobs(true);
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
      {/* recent activity removed */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recommended Jobs</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Personalized job recommendations based on your preferences and activity
          </p>
          {personalized === false && (
            <div className="mt-2 inline-flex items-center gap-2 text-sm text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1112 3a9 9 0 019 9z"/></svg>
              <span>Showing recent & popular jobs — interact (view/save/apply) to personalize recommendations.</span>
            </div>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center px-4 py-2 bg-[#10b981]  text-white text-sm font-medium rounded-[10px] shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No recommendations yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Update your job preferences in settings to get personalized recommendations
          </p>
          <button
            onClick={() => window.location.href = `${userRole === 'admin' ? '/' : '/'}`}
            className="inline-flex items-center px-4 py-2 bg-[#10b981]  text-white text-sm font-medium rounded-[10px] shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] hover:-translate-y-1 transition-all duration-300"
          >
            Update Preferences
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(380px,1fr))] gap-4 mb-6">
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

          {/* <div className="flex items-center justify-center gap-3">
            <button
              onClick={async () => {
                if (!user || jobs.length === 0 || !jobs[0]?.id) return;
                const jobId = jobs[0].id as string;
                const job = jobs[0];

                try {
                  // Track "not interested" activity
                  activityTracker.trackActivity(jobId, 'hide', {
                    title: job.title,
                    location: job.location,
                    company: job.company?.name,
                    category: job.job_category,
                    employmentType: job.employment_type,
                    reason: 'not_interested'
                  });

                  // Remove from current recommendations
                  setJobs(prev => prev.filter(j => j.id !== jobId));
                  toast.success('Marked as not interested');

                  // Refresh recommendations to get new ones (faster update)
                  setTimeout(() => {
                    fetch('/api/jobs?limit=50').then(response => {
                      if (response.ok) {
                        response.json().then(data => {
                          const allJobs = data.jobs || [];
                          const newRecommendedJobs = activityTracker.getRecommendedJobs(allJobs);
                          if (newRecommendedJobs.length > 0) {
                            setJobs(newRecommendedJobs);
                          }
                        });
                      }
                    }).catch(() => {});
                  }, 300);
                } catch (e) {
                  console.error('Error marking not interested:', e);
                  toast.error('Failed to mark as not interested');
                }
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Not Interested
            </button>
            <button
              onClick={() => {
                if (!user || jobs.length === 0 || !jobs[0]?.id) return;
                const jobId = jobs[0].id as string;
                const job = jobs[0];

                try {
                  // Track hide activity
                  activityTracker.trackActivity(jobId, 'hide', {
                    title: job.title,
                    location: job.location,
                    company: job.company?.name,
                    category: job.job_category,
                    employmentType: job.employment_type,
                    reason: 'hidden'
                  });

                  // Remove from current recommendations
                  setJobs(prev => prev.filter(j => j.id !== jobId));
                  toast.success('Job hidden from recommendations');

                  // Refresh recommendations to get new ones (faster update)
                  setTimeout(() => {
                    fetch('/api/jobs?limit=50').then(response => {
                      if (response.ok) {
                        response.json().then(data => {
                          const allJobs = data.jobs || [];
                          const newRecommendedJobs = activityTracker.getRecommendedJobs(allJobs);
                          if (newRecommendedJobs.length > 0) {
                            setJobs(newRecommendedJobs);
                          }
                        });
                      }
                    }).catch(() => {});
                  }, 300);
                } catch (e) {
                  console.error('Error hiding job:', e);
                  toast.error('Failed to hide job');
                }
              }}
              disabled={jobs.length === 0}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hide This Job
            </button>
          </div> */}
        </>
      )}
    </div>
  );
};

export default RelevantJobsTab;