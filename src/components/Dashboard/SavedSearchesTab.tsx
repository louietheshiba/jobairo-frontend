import React from 'react';

const SavedSearchesTab: React.FC = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Saved Searches</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Your saved filter combinations (3)
          </p>
        </div>
        <button className="px-4 py-2 bg-primary-10 text-white rounded-lg hover:bg-primary-15 transition-colors">
          Create New Search
        </button>
      </div>

      <div className="space-y-4">
        <div className="bg-white dark:bg-dark-20 rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white hover:text-primary-10 dark:hover:text-primary-10 transition-colors cursor-pointer">Senior Developer Roles</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Position: Senior Software Engineer • Location: Remote • Salary: $120K+
              </p>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs font-medium">
              5 new jobs
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button className="inline-flex items-center px-4 py-2 bg-primary-10 text-white text-sm font-medium rounded-md hover:bg-primary-15 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-10 focus:ring-offset-2">
              Run Search
            </button>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" className="rounded border-gray-300 text-primary-10 focus:ring-primary-10" />
              <span className="text-gray-700 dark:text-gray-300">Email alerts</span>
            </label>
            <button className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm font-medium transition-colors">
              Edit
            </button>
            <button className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors">
              Delete
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-20 rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white hover:text-primary-10 dark:hover:text-primary-10 transition-colors cursor-pointer">Frontend Positions</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Position: Frontend Developer • Location: San Francisco • Experience: Mid Level
              </p>
            </div>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium">
              2 new jobs
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button className="inline-flex items-center px-4 py-2 bg-primary-10 text-white text-sm font-medium rounded-md hover:bg-primary-15 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-10 focus:ring-offset-2">
              Run Search
            </button>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" className="rounded border-gray-300 text-primary-10 focus:ring-primary-10" defaultChecked />
              <span className="text-gray-700 dark:text-gray-300">Email alerts</span>
            </label>
            <button className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm font-medium transition-colors">
              Edit
            </button>
            <button className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedSearchesTab;