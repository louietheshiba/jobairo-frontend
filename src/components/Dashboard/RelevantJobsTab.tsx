import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/utils/supabase';
import JobListCard from '@/components/ui/jobListCard';
import JobTabs from './JobTabs';
import type { Job } from '@/types/JobTypes';
import toast from 'react-hot-toast';
import { activityTracker } from '@/utils/activityTracker';

interface RelevantJobsTabProps {
  jobs?: Job[];
  onCardClick: (job: Job) => void;
}

const CACHE_KEY = 'relevantJobsCache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Dummy job data to match the design
const DUMMY_JOBS: Job[] = [
  {
    id: 'dummy-1',
    title: 'Senior Product Designer',
    description: 'We are looking for an experienced Senior Product Designer to join our team. You will be responsible for creating intuitive, user-centered designs that solve complex problems.',
    location: 'Seattle, WA',
    employment_type: 'full-time',
    remote_type: 'hybrid',
    salary_range: '$140k - $180k',
    department: 'Design Systems',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    application_url: 'https://careers.microsoft.com',
    companies: {
      id: 'ms',
      name: 'Microsoft',
      logo: null,
      website: 'https://microsoft.com',
    },
  },
  {
    id: 'dummy-2',
    title: 'iOS Developer',
    description: 'Join our iOS team to build cutting-edge mobile applications. You will work on innovative features that impact millions of users worldwide.',
    location: 'Cupertino, CA',
    employment_type: 'full-time',
    remote_type: 'on-site',
    salary_range: '$160k - $220k',
    department: 'SwiftUI',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    application_url: 'https://jobs.apple.com',
    companies: {
      id: 'apple',
      name: 'Apple',
      logo: null,
      website: 'https://apple.com',
    },
  },
  {
    id: 'dummy-3',
    title: 'Senior Frontend Engineer',
    description: 'Build beautiful, responsive web applications using modern frameworks. Work with a talented team to create exceptional user experiences.',
    location: 'San Francisco, CA',
    employment_type: 'full-time',
    remote_type: 'remote',
    salary_range: '$150k - $200k',
    department: 'Engineering',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    application_url: 'https://example.com',
    companies: {
      id: 'google',
      name: 'Google',
      logo: null,
      website: 'https://google.com',
    },
  },
  {
    id: 'dummy-4',
    title: 'Product Manager',
    description: 'Lead product strategy and execution for our flagship products. Collaborate with engineering, design, and business teams.',
    location: 'New York, NY',
    employment_type: 'full-time',
    remote_type: 'hybrid',
    salary_range: '$140k - $190k',
    department: 'Product',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    application_url: 'https://example.com',
    companies: {
      id: 'meta',
      name: 'Meta',
      logo: null,
      website: 'https://meta.com',
    },
  },
];

const RelevantJobsTab: React.FC<RelevantJobsTabProps> = ({ jobs: initialJobs, onCardClick }) => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>(DUMMY_JOBS); // Use dummy data
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [activeFilter, setActiveFilter] = useState('recommended');
  const [personalized, setPersonalized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false); // Set to false to show immediately
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

  // ✅ Fetch when component mounts (disabled for dummy data)
  useEffect(() => {
    // Using dummy data for now, so skip the fetch
    if (initialJobs && initialJobs.length > 0) {
      setJobs(initialJobs);
    }
  }, [initialJobs]);

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

  // Handle filter changes
  const handleFilterChange = useCallback((filter: string) => {
    setActiveFilter(filter);
    
    let filtered = [...jobs];
    
    switch (filter) {
      case 'latest':
        filtered = filtered.sort((a, b) => 
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
        break;
      case 'remote':
        filtered = filtered.filter(job => 
          job.remote_type?.toLowerCase().includes('remote')
        );
        break;
      case 'high-match':
        // Keep the recommended order (already sorted by relevance)
        break;
      case 'recommended':
      default:
        // Keep original order
        break;
    }
    
    setFilteredJobs(filtered);
  }, [jobs]);

  // Update filtered jobs when jobs change
  useEffect(() => {
    handleFilterChange(activeFilter);
  }, [jobs, activeFilter, handleFilterChange]);

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
      {/* Tab Filters */}
      <JobTabs activeFilter={activeFilter} onFilterChange={handleFilterChange} />

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No jobs found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Try adjusting your filters or update your preferences to get personalized recommendations.
          </p>
          <button
            onClick={() => fetchRelevantJobs(true)}
            className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-medium shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:-translate-y-0.5 transition-all duration-300"
          >
            Refresh Jobs
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredJobs.map((job) => (
            <JobListCard key={job.id} item={job} onClick={onCardClick} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RelevantJobsTab;
