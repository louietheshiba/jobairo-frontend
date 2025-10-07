

import React, { useState } from 'react';
import { Meta } from '@/layouts/Meta';
import JobDetailsModal from '@/components/Modals/JobDetail';
import DashboardSidebar from '@/components/Dashboard/DashboardSidebar';
import DashboardStats from '@/components/Dashboard/DashboardStats';
import DashboardContent from '@/components/Dashboard/DashboardContent';
import { ProfileProvider } from '@/context/ProfileContext';
import type { Job } from '@/types/JobTypes';
import ProtectedRoute from '@/components/ProtectedRoute';
import Container from '@/layouts/Container';



const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('relevant');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const handleCardClick = (job: Job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
  };


  return (
    <ProtectedRoute requireAuth={true}>
      <ProfileProvider>
        <Container>

          <Meta title="Dashboard - Job Airo" description="Job Airo Dashboard" />
          <div className="min-h-screen bg-gray-50 dark:bg-dark-25 font-poppins">
            <div className="flex min-h-screen">
              <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />

              {/* Main Content */}
              <div className="flex-1 ml-64 p-8 overflow-y-auto min-h-screen">
                <div className="max-w-6xl mx-auto">
                  <DashboardStats />

                  <DashboardContent
                    activeTab={activeTab}
                    onCardClick={handleCardClick}
                  />
                </div>
              </div>
            </div>

            <JobDetailsModal
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              job={selectedJob}
            />
          </div>
        </Container>
      </ProfileProvider>
    </ProtectedRoute>
  );
};

export default Dashboard;