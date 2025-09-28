import React from 'react';
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
  mockRecommendedJobs: Job[];
  mockAppliedJobs: (Job & { appliedDate: string; status: string; notes?: string })[];
  mockSavedJobs: (Job & { savedDate: string })[];
  onCardClick: (job: Job) => void;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  activeTab,
  mockRecommendedJobs,
  mockAppliedJobs,
  mockSavedJobs,
  onCardClick,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm dark:bg-dark-20">
      <div className="p-6">
        {activeTab === 'relevant' && (
          <RelevantJobsTab jobs={mockRecommendedJobs} onCardClick={onCardClick} />
        )}

        {activeTab === 'saved' && (
          <SavedJobsTab jobs={mockSavedJobs} onCardClick={onCardClick} />
        )}

        {activeTab === 'applied' && (
          <AppliedJobsTab jobs={mockAppliedJobs} onCardClick={onCardClick} />
        )}

        {activeTab === 'hidden' && <HiddenJobsTab />}

        {activeTab === 'searches' && <SavedSearchesTab />}

        {activeTab === 'viewed' && <RecentlyViewedTab />}

        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
};

export default DashboardContent;