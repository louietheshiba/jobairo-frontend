import { Bookmark } from 'lucide-react';
import React from 'react';
import type { JobListCardProps } from '@/types/JobTypes';
import LoginPrompt from '@/components/LoginPrompt';
import { useAuth } from '@/hooks/useAuth';

const JobListCard = ({ item, onClick }: JobListCardProps) => {
  const { user } = useAuth();

  const handleSaveJob = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (user) {
      // TODO: Implement save job functionality
      console.log('Save job:', item?.title);
    }
  };

  return (
    <div
      onClick={() => onClick(item)}
      className="group relative flex min-h-[220px] flex-col gap-3 rounded-lg bg-white p-[20px] shadow-sm transition-all duration-300 hover:shadow-lg cursor-pointer dark:bg-dark-25"
    >
      {/* Bookmark Button */}
      <button
        className="absolute top-4 right-4 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-dark-30"
        onClick={(e) => {
          e.stopPropagation();
          console.log('Save clicked');
        }}
      >
        <Bookmark className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
      </button>

      {/* Job Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-poppins text-lg font-semibold text-secondary dark:text-white">
          {item?.title}
        </h2>
        <span className="font-poppins text-sm font-semibold text-secondary dark:text-white sm:text-base">
          {item?.salary_range || 'Salary not specified'}
        </span>
      </div>

      {/* Company Info */}
      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
            {item?.company?.name?.charAt(0) || '?'}
          </div>
          <span className="font-medium">{item?.company?.name || 'Company not specified'}</span>
        </div>
        <span className="capitalize">{item?.employment_type || 'Not specified'}</span>
        <span>{item?.location || 'Location not specified'}</span>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
        {item?.description || 'No description available'}
      </p>

      {/* Job Tags */}
      <div className="flex flex-wrap gap-2">
        <span className={`tag capitalize ${item?.employment_type?.toLowerCase()}`}>
          {item?.employment_type}
        </span>
        <span className={`tag capitalize ${item?.remote_type?.toLowerCase()}`}>
          {item?.remote_type}
        </span>
        {item?.department && (
          <span className="tag">
            {item.department}
          </span>
        )}
      </div>

      {/* Hover "Quick Apply" Button */}
      <div className="absolute bottom-0 left-0 w-full px-[20px] pb-[20px]">
        <div className="w-full opacity-0 translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
          <button
            className="w-full rounded-md border border-primary-10 bg-primary-10 py-2 font-poppins text-sm font-medium text-white duration-300 hover:border-primary-15 hover:bg-primary-15"
            onClick={(e) => {
              e.stopPropagation();
              onClick(item); // Open modal
            }}
          >
            Quick Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobListCard;
