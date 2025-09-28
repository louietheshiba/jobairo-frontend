import React from 'react';
import { Select } from '@/components/ui/select';
import type { Job } from '@/types/JobTypes';

interface AppliedJobsTabProps {
  jobs: (Job & { appliedDate: string; status: string; notes?: string })[];
  onCardClick: (job: Job) => void;
}

const AppliedJobsTab: React.FC<AppliedJobsTabProps> = ({ jobs, onCardClick }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Applied Jobs</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your job applications ({jobs.length})
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Select
            value={{ label: 'All Status', value: 'all' }}
            onChange={() => { }}
            options={[
              { label: 'All Status', value: 'all' },
              { label: 'Applied', value: 'applied' },
              { label: 'Viewed', value: 'viewed' },
              { label: 'Interview', value: 'interview' },
              { label: 'Rejected', value: 'rejected' },
              { label: 'Accepted', value: 'accepted' }
            ]}
            placeholder="Filter by status"
          />

          <input
            type="date"
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-10 focus:border-transparent"
            placeholder="Filter by date"
          />
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
                      {job.company_name} • {job.salary}
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