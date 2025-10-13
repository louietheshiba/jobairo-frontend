

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { Meta } from '@/layouts/Meta';
import JobDetailsModal from '@/components/Modals/JobDetail';
import DashboardSidebar from '@/components/Dashboard/DashboardSidebar';
import DashboardStats from '@/components/Dashboard/DashboardStats';
import DashboardContent from '@/components/Dashboard/DashboardContent';
import { ProfileProvider } from '@/context/ProfileContext';
import type { Job } from '@/types/JobTypes';
import ProtectedRoute from '@/components/ProtectedRoute';
import Container from '@/layouts/Container';
import AdminSidebar from '@/components/Admin/AdminSidebar';
import AdminStats from '@/components/Admin/AdminStats';
import AdminJobs from '@/components/Admin/AdminJobs';

const Dashboard = () => {
   const router = useRouter();
   const { user, userRole, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('saved');
  const [adminActiveTab, setAdminActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }
  }, [user, loading, router]);

  const handleCardClick = (job: Job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
  };

  // Admin Dashboard
  if (userRole === 'admin' && !loading) {
    const renderContent = () => {
      switch (adminActiveTab) {
        case 'dashboard':
          return (
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
              </div>
              <AdminStats />
            </div>
          );
        case 'jobs':
          return <AdminJobs />;
        case 'users':
          return (
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">User Management</h1>
              </div>
              <div className="bg-white dark:bg-dark-25 rounded-xl shadow-sm border border-gray-200 dark:border-dark-20 p-8">
                <p className="text-gray-600 dark:text-gray-300">User management interface coming soon...</p>
              </div>
            </div>
          );
        default:
          return (
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
              </div>
              <AdminStats />
            </div>
          );
      }
    };

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black">
        <AdminSidebar activeTab={adminActiveTab} onTabChange={setAdminActiveTab} />
        <div className="ml-64 p-8">
          {renderContent()}
        </div>
      </div>
    );
  }

  // Regular User Dashboard
  return (
    <ProtectedRoute requireAuth={true}>
      <ProfileProvider>
        <Container>
          <Meta title="Dashboard - Job Airo" description="Job Airo Dashboard" />
          <div className="min-h-screen font-poppins">
            <div className="flex min-h-screen">
              <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />

              {/* Main Content */}
              <div className="flex-1 ml-64 p-8 overflow-y-auto min-h-screen dark:bg-black">
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