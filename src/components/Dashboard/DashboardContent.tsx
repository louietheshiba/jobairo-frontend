import React, { useEffect } from 'react';
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
  // Force re-render when activeTab changes to ensure fresh data
  useEffect(() => {
    // Dispatch a custom event to trigger stats refresh when switching tabs
    window.dispatchEvent(new CustomEvent('statsRefresh'));
  }, [activeTab]);

  return (
    <div className="bg-white rounded-lg shadow-sm dark:bg-dark-20">
      <div className="p-6">
        {activeTab === 'relevant' && (
          <RelevantJobsTab key={`relevant-${Date.now()}`} onCardClick={onCardClick} />
        )}

        {activeTab === 'saved' && (
          <SavedJobsTab key={`saved-${Date.now()}`} onCardClick={onCardClick} />
        )}

        {activeTab === 'applied' && (
          <AppliedJobsTab key={`applied-${Date.now()}`} onCardClick={onCardClick} />
        )}

        {activeTab === 'hidden' && <HiddenJobsTab key={`hidden-${Date.now()}`} />}

        {activeTab === 'searches' && <SavedSearchesTab key={`searches-${Date.now()}`} />}

        {activeTab === 'viewed' && <RecentlyViewedTab key={`viewed-${Date.now()}`} />}

        {activeTab === 'settings' && <SettingsTab key={`settings-${Date.now()}`} />}
      </div>
    </div>
  );
};

export default DashboardContent;