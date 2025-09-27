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
      {/* Top Row - Title and Save Icon */}
      <div className="flex items-center justify-between">
        <h2 className="font-poppins text-lg font-semibold text-secondary dark:text-white">
          {item?.title}
        </h2>
        <span className="font-poppins text-sm font-semibold text-secondary dark:text-white sm:text-base">
          {item?.salary}
        </span>
      </div>

      {/* Meta Info */}
      <div className="flex items-center gap-1 text-sm text-black dark:text-white">
        {item?.source?.map((content, index) => (
          <span key={index} className="flex items-center gap-1">
            {index > 0 && <span>•</span>}
            {content}
          </span>
        ))}
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
        {item?.description}
      </p>

      {/* Save Icon */}
      {user ? (
        <button
          className="absolute top-4 right-4 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-dark-30"
          onClick={handleSaveJob}
        >
          <Bookmark className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
        </button>
      ) : (
        <LoginPrompt action="save jobs" className="absolute top-4 right-4">
          <button className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-dark-30">
            <Bookmark className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
          </button>
        </LoginPrompt>
      )}

      {/* Hover "Quick Apply" Button */}
      <div className="absolute bottom-0 left-0 w-full px-[20px] pb-[20px]">
        <div className="w-full opacity-0 translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
          <button className="w-full rounded-md border border-[#319795] bg-[#319795] py-2 font-poppins text-sm font-medium text-white duration-300 hover:border-[#246463] hover:bg-[#246463]">
            Quick Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobListCard;
