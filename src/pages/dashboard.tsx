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
import AdminUsers from '@/components/Admin/AdminUsers';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

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

  // Preload dashboard data when user is available
  useEffect(() => {
    if (user && !loading) {
      // Delay stats refresh to avoid blocking initial render
      const timer = setTimeout(() => {
        window.dispatchEvent(new CustomEvent('statsRefresh'));
      }, 200);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [user, loading]);

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
    return (
      <ProtectedRoute requireAuth={true}>
        <ProfileProvider>
          <Container>
            <Meta title="Admin Dashboard - Job Airo" description="Admin Dashboard" />
            <div className="min-h-screen font-poppins">
              <div className="flex min-h-screen">
                <AdminSidebar activeTab={adminActiveTab} onTabChange={setAdminActiveTab} />

                {/* Main Content */}
                <div className="flex-1 ml-64 overflow-y-auto min-h-screen dark:bg-black">
                  <div className="mx-auto w-full max-w-screen-xl px-5 xl:px-1 p-8">
                    <div className="mb-6 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Link href="/" className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[#065f46] bg-[#ecfdf5] hover:bg-[#d1fae5]">
                          <ArrowLeft className="w-4 h-4" />
                          Back to Home
                        </Link>
                      </div>
                    </div>

                    {adminActiveTab === 'dashboard' && <AdminStats />}
                    {adminActiveTab === 'jobs' && <AdminJobs />}
                    {adminActiveTab === 'users' && (
                                          <div className="bg-white rounded-lg shadow-sm dark:bg-dark-20">
                                            <div className="p-6">
                                              <AdminUsers />
                                            </div>
                                          </div>
                                        )}
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
              <div className="flex-1 ml-64 overflow-y-auto min-h-screen dark:bg-black">
                <div className="mx-auto w-full max-w-screen-xl px-5 xl:px-1 p-8">
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Link href="/" className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[#065f46] bg-[#ecfdf5] hover:bg-[#d1fae5]">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                      </Link>
                    </div>
                  </div>
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