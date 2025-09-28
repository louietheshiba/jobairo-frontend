import React from 'react';
import JobListCard from '@/components/ui/jobListCard';
import type { Job } from '@/types/JobTypes';

interface RelevantJobsTabProps {
  jobs: Job[];
  onCardClick: (job: Job) => void;
}

const RelevantJobsTab: React.FC<RelevantJobsTabProps> = ({ jobs, onCardClick }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recommended Jobs</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Personalized job recommendations based on your activity
          </p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-primary-10 text-white text-sm font-medium rounded-md hover:bg-primary-15 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-10 focus:ring-offset-2">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Recommendations
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {jobs.map((job, index) => (
          <div key={job.id} className="relative">
            <JobListCard item={job} onClick={onCardClick} />
            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                💡 {index === 0 ? 'Similar to Senior Developer role you saved' :
                  index === 1 ? 'Matches your React experience' :
                    'Based on companies you viewed'}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-3">
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
          Not Interested
        </button>
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
          Hide This
        </button>
      </div>
    </div>
  );
};

export default RelevantJobsTab;