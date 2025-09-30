import React from 'react';
import { Eye as ViewIcon, Heart as SaveIcon, FileText as ApplyIcon } from 'lucide-react';

const DashboardStats: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white p-6 rounded-lg shadow-sm dark:bg-dark-20 hover:shadow-md transition-all duration-200 cursor-pointer">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900 transition-colors duration-200">
            <ViewIcon className="w-6 h-6 text-blue-600 dark:text-blue-300" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Jobs Viewed</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">24</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm dark:bg-dark-20 hover:shadow-md transition-all duration-200 cursor-pointer">
        <div className="flex items-center">
          <div className="p-2 bg-red-100 rounded-lg dark:bg-red-900 transition-colors duration-200">
            <SaveIcon className="w-6 h-6 text-red-600 dark:text-red-300" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Jobs Saved</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">8</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm dark:bg-dark-20 hover:shadow-md transition-all duration-200 cursor-pointer">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 rounded-lg dark:bg-green-900 transition-colors duration-200">
            <ApplyIcon className="w-6 h-6 text-green-600 dark:text-green-300" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Jobs Applied</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">3</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default DashboardStats;