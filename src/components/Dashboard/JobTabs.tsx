import React from 'react';

interface JobTabsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const JobTabs: React.FC<JobTabsProps> = ({ activeFilter, onFilterChange }) => {
  const tabs = [
    { id: 'recommended', label: 'Recommended for You' },
    { id: 'latest', label: 'Latest Jobs' },
    { id: 'remote', label: 'Remote Only' },
    { id: 'high-match', label: 'High Match' },
  ];

  return (
    <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
      <div className="flex gap-1 overflow-x-auto pb-px scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onFilterChange(tab.id)}
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-all relative ${
              activeFilter === tab.id
                ? 'text-green-600 dark:text-green-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {tab.label}
            {activeFilter === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 dark:bg-green-400"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default JobTabs;

