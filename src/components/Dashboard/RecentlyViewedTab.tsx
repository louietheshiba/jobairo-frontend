import React from 'react';

const RecentlyViewedTab: React.FC = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recently Viewed</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Jobs you've viewed in the last 50 days (8)
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
            Clear History
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-white dark:bg-dark-20 rounded-lg shadow-sm p-4 opacity-60 hover:opacity-100 transition-opacity">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white">Senior Software Engineer</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Meta • Full Time • $140K/year</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">Viewed 2 hours ago</p>
              <div className="flex gap-1 mt-1">
                <button className="px-2 py-1 bg-primary-10 text-white rounded text-xs hover:bg-primary-15 transition-colors">
                  Save
                </button>
                <button className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                  Hide
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-20 rounded-lg shadow-sm p-4 opacity-60 hover:opacity-100 transition-opacity">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white">Frontend Developer</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Netflix • Full Time • $125K/year</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">Viewed 1 day ago</p>
              <div className="flex gap-1 mt-1">
                <button className="px-2 py-1 bg-primary-10 text-white rounded text-xs hover:bg-primary-15 transition-colors">
                  Save
                </button>
                <button className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                  Hide
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentlyViewedTab;