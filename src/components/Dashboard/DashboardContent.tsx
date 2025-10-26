import React, { useEffect, useMemo } from 'react';
import RelevantJobsTab from './RelevantJobsTab';
import SavedJobsTab from './SavedJobsTab';
import AppliedJobsTab from './AppliedJobsTab';
import HiddenJobsTab from './HiddenJobsTab';
import SavedSearchesTab from './SavedSearchesTab';
import RecentlyViewedTab from './RecentlyViewedTab';
import SettingsTab from './SettingsTab';
import type { Job } from '@/types/JobTypes';

interface DashboardContentProps {
  activeTab: string;
  onCardClick: (job: Job) => void;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  activeTab,
  onCardClick,
}) => {
  /** 🔁 Emit events when the active tab changes */
  useEffect(() => {
    const emitTabChange = () => {
      window.dispatchEvent(new CustomEvent('statsRefresh'));
      window.dispatchEvent(new CustomEvent('tabChanged', { detail: { tab: activeTab } }));
    };

    emitTabChange();
  }, [activeTab]);

  /** 🧠 Memoized content renderer (prevents unnecessary re-renders) */
  const content = useMemo(() => {
    switch (activeTab) {
      case 'relevant':
        return <RelevantJobsTab onCardClick={onCardClick} />;
      case 'saved':
        return <SavedJobsTab onCardClick={onCardClick} />;
      case 'applied':
        return <AppliedJobsTab onCardClick={onCardClick} />;
      case 'hidden':
        return <HiddenJobsTab />;
      case 'searches':
        return <SavedSearchesTab />;
      case 'viewed':
        return <RecentlyViewedTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return (
          <div className="text-center text-gray-500 py-10">
            Unknown tab selected
          </div>
        );
    }
  }, [activeTab, onCardClick]);

  /** 🎨 Smooth transition container */
  return (
    <div
      className="
        bg-white 
        dark:bg-dark-20 
        rounded-lg 
        shadow-sm 
        transition-all 
        duration-300 
        ease-in-out
      "
    >
      <div className="p-6 animate-fadeIn">{content}</div>
    </div>
  );
};

export default DashboardContent;
