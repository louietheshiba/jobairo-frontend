import React from 'react';

const HiddenJobsTab: React.FC = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Hidden Jobs</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Jobs you've hidden from recommendations (2)
          </p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
          Unhide All
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-white dark:bg-dark-20 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Product Manager</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Amazon • Full Time • $150K/year</p>
              <div className="inline-flex items-center px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs rounded-full">
                Not interested in management roles
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Unhide
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-20 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Sales Manager</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Microsoft • Full Time • $130K/year</p>
              <div className="inline-flex items-center px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs rounded-full">
                Not interested in sales positions
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Unhide
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          <strong>Note:</strong> Hidden jobs will be automatically deleted after 30 days.
        </p>
      </div>
    </div>
  );
};

export default HiddenJobsTab;