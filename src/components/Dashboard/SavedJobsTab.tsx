import React, { useState } from 'react';
import JobListCard from '@/components/ui/jobListCard';
import { Select } from '@/components/ui/select';
import type { Job } from '@/types/JobTypes';
import type { Option } from '@/types/FiltersType';

interface SavedJobsTabProps {
  jobs: (Job & { savedDate: string })[];
  onCardClick: (job: Job) => void;
}

const SavedJobsTab: React.FC<SavedJobsTabProps> = ({ jobs, onCardClick }) => {
  const [savedJobsView, setSavedJobsView] = useState<'grid' | 'list'>('grid');
  const [selectedJobs, setSelectedJobs] = useState<number[]>([]);
  const [savedJobsSort, setSavedJobsSort] = useState('date');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Saved Jobs</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Jobs you've saved for later ({jobs.length})
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setSavedJobsView('grid')}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${savedJobsView === 'grid'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300'
                }`}
            >
              Grid
            </button>
            <button
              onClick={() => setSavedJobsView('list')}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${savedJobsView === 'list'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300'
                }`}
            >
              List
            </button>
          </div>

          {/* Sort Dropdown */}
          <Select
            value={{ label: savedJobsSort === 'date' ? 'Date Saved' : savedJobsSort === 'company' ? 'Company' : 'Salary', value: savedJobsSort }}
            onChange={(selected) => {
              const value = selected as Option;
              setSavedJobsSort(value?.value || 'date');
            }}
            options={[
              { label: 'Date Saved', value: 'date' },
              { label: 'Company', value: 'company' },
              { label: 'Salary', value: 'salary' }
            ]}
            placeholder="Sort by"
          />
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedJobs.length > 0 && (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-between">
          <span className="text-sm text-blue-700 dark:text-blue-300">
            {selectedJobs.length} job{selectedJobs.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <button className="inline-flex items-center px-3 py-1.5 bg-primary-10 text-white text-sm font-medium rounded-md hover:bg-primary-15 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-10 focus:ring-offset-2">
              Apply to All
            </button>
            <button className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
              Unsave Selected
            </button>
          </div>
        </div>
      )}

      {/* Jobs Grid/List */}
      <div className={savedJobsView === 'grid' ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
        {jobs.map((job) => (
          <div key={job.id} className="relative">
            {savedJobsView === 'grid' ? (
              <>
                <div className="absolute top-2 left-2 z-10">
                  <input
                    type="checkbox"
                    checked={selectedJobs.includes(job.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedJobs([...selectedJobs, job.id]);
                      } else {
                        setSelectedJobs(selectedJobs.filter(id => id !== job.id));
                      }
                    }}
                    className="w-4 h-4 text-primary-10 bg-gray-100 border-gray-300 rounded focus:ring-primary-10 dark:focus:ring-primary-10 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <JobListCard item={job} onClick={onCardClick} />
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Saved on {new Date(job.savedDate).toLocaleDateString()}
                </div>
              </>
            ) : (
              <div className="flex items-center p-4 bg-white dark:bg-dark-20 rounded-lg shadow-sm">
                <input
                  type="checkbox"
                  checked={selectedJobs.includes(job.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedJobs([...selectedJobs, job.id]);
                    } else {
                      setSelectedJobs(selectedJobs.filter(id => id !== job.id));
                    }
                  }}
                  className="w-4 h-4 text-primary-10 bg-gray-100 border-gray-300 rounded focus:ring-primary-10 dark:focus:ring-primary-10 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 mr-4"
                />
                <div className="flex-1 cursor-pointer" onClick={() => onCardClick(job)}>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{job.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{job.company_name} • {job.job_type}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">{job.salary}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Saved {new Date(job.savedDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Export Options */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Export your saved jobs</span>
          <div className="flex gap-3">
            <button className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
              Export as PDF
            </button>
            <button className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
              Export as CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedJobsTab;