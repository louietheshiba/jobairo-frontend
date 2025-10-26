import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import JobRow from './JobRow';

const JobTable = ({
  jobs,
  hasMore,
  fetchMore,
  selectedJobs,
  setSelectedJobs,
  onEdit,
  onStatusChange,
  getStatusColor,
}: any) => (
  <div className="bg-white dark:bg-dark-25 border border-gray-200 dark:border-dark-20 rounded-xl shadow-sm overflow-hidden">
    <InfiniteScroll
      dataLength={jobs.length}
      next={fetchMore}
      hasMore={hasMore}
      loader={<div className="flex justify-center py-4"><div className="animate-spin h-6 w-6 border-b-2 border-[#10b981] rounded-full" /></div>}
      endMessage={<p className="text-center py-4 text-gray-500 text-sm">All jobs loaded</p>}
    >
      <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-20">
        <thead className="bg-gray-50 dark:bg-dark-20">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-white uppercase">Select</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-white uppercase">Title</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-white uppercase">Company</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-white uppercase">Location</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-white uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-white uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-dark-20">
          {jobs.map((job: any) => (
            <JobRow
              key={job.id}
              job={job}
              selectedJobs={selectedJobs}
              setSelectedJobs={setSelectedJobs}
              onEdit={onEdit}
              onStatusChange={onStatusChange}
              getStatusColor={getStatusColor}
            />
          ))}
        </tbody>
      </table>
    </InfiniteScroll>
  </div>
);

export default JobTable;
