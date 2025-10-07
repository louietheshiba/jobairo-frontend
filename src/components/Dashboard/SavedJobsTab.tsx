import React, { useState, useEffect } from 'react';
import JobListCard from '@/components/ui/jobListCard';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/utils/supabase';
import type { Job } from '@/types/JobTypes';

interface SavedJobsTabProps {
  onCardClick: (job: Job) => void;
}

const SavedJobsTab: React.FC<SavedJobsTabProps> = ({ onCardClick }) => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<(Job & { savedDate: string })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedJobs = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_jobs')
        .select('job_id, created_at')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching saved jobs:', error);
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
        const saved = data.find(s => s.job_id === job.id);
        return { ...job, savedDate: saved?.created_at || '' };
      });

      setJobs(jobsWithDate);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, [user]);

  useEffect(() => {
    // Listen for stats refresh events to update the list when jobs are saved/unsaved
    const handleRefresh = () => {
      fetchSavedJobs();
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
          <p className="text-gray-600 dark:text-gray-400">Loading saved jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Saved Jobs</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Jobs you've saved for later ({jobs.length})
          </p>
        </div>

        {jobs.length > 0 && (
          <div className="flex items-center gap-4">
            {/* Export Options */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  // Basic PDF export - in production, use jsPDF
                  const printWindow = window.open('', '_blank');
                  if (printWindow) {
                    printWindow.document.write(`
                      <html>
                        <head><title>Saved Jobs</title></head>
                        <body>
                          <h1>Saved Jobs</h1>
                          ${jobs.map(job => `
                            <div style="margin-bottom: 20px; border: 1px solid #ccc; padding: 10px;">
                              <h2>${job.title}</h2>
                              <p><strong>Company:</strong> ${job.company?.name}</p>
                              <p><strong>Location:</strong> ${job.location}</p>
                              <p><strong>Type:</strong> ${job.employment_type}</p>
                              <p><strong>Salary:</strong> ${job.salary_range}</p>
                              <p><strong>Saved:</strong> ${new Date(job.savedDate).toLocaleDateString()}</p>
                            </div>
                          `).join('')}
                        </body>
                      </html>
                    `);
                    printWindow.document.close();
                    printWindow.print();
                  }
                }}
                className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Export as PDF
              </button>
              <button
                onClick={() => {
                  const csvContent = [
                    ['Title', 'Company', 'Location', 'Type', 'Salary', 'Saved Date'],
                    ...jobs.map(job => [
                      job.title,
                      job.company?.name || '',
                      job.location,
                      job.employment_type,
                      job.salary_range,
                      new Date(job.savedDate).toLocaleDateString()
                    ])
                  ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'saved_jobs.csv';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Export as CSV
              </button>
            </div>
          </div>
        )}
      </div>


      {jobs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 text-lg">No saved jobs yet</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Start saving jobs to see them here</p>
        </div>
      ) : (
        /* Jobs Grid */
        <div className="grid gap-5 gap-y-[30px] sm:gap-y-[50px] md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <div key={job.id} className="relative">
              <JobListCard item={job} onClick={onCardClick} isSaved={true} />
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Saved on {new Date(job.savedDate).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default SavedJobsTab;