'use client';
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
import AdminJobs from '@/components/Admin/jobs/AdminJobs';
import AdminUsers from '@/components/Admin/Users/AdminUsers';
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
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user && !loading) {
      const timer = setTimeout(() => window.dispatchEvent(new CustomEvent('statsRefresh')), 200);
      return () => clearTimeout(timer);
    }
  }, [user, loading]);

  const handleCardClick = (job: Job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
  };

  /** ✅ Admin Dashboard */
  if (userRole === 'admin' && !loading) {
    return (
      <ProtectedRoute requireAuth>
        <ProfileProvider>
          <Container>
            <Meta title="Admin Dashboard - Job Airo" description="Admin Dashboard" />
            <div className="min-h-screen flex flex-col md:flex-row dark:bg-black font-poppins">
              <AdminSidebar activeTab={adminActiveTab} onTabChange={setAdminActiveTab} />

              <main className="flex-1 md:ml-64 p-6 sm:p-8 overflow-y-auto">
                <div className="mb-6 flex items-center justify-between">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[#065f46] bg-[#ecfdf5] hover:bg-[#d1fae5]"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                  </Link>
                </div>

                {adminActiveTab === 'dashboard' && <AdminStats />}
                {adminActiveTab === 'jobs' && <AdminJobs />}
                {adminActiveTab === 'users' && (
                    <AdminUsers />
                )}
              </main>

              <JobDetailsModal isOpen={isModalOpen} onClose={handleCloseModal} job={selectedJob} />
            </div>
          </Container>
        </ProfileProvider>
      </ProtectedRoute>
    );
  }

  /** ✅ User Dashboard */
  return (
    <ProtectedRoute requireAuth>
      <ProfileProvider>
        <Container>
          <Meta title="Dashboard - Job Airo" description="Job Airo Dashboard" />
          <div className="min-h-screen flex flex-col md:flex-row dark:bg-black font-poppins">
            <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />

            <main className="flex-1 md:ml-64 p-6 sm:p-8 overflow-y-auto">
              <div className="mb-6 flex items-center justify-between">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[#065f46] bg-[#ecfdf5] hover:bg-[#d1fae5]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </Link>
              </div>

              <DashboardStats />
              <DashboardContent activeTab={activeTab} onCardClick={handleCardClick} />
            </main>

            <JobDetailsModal isOpen={isModalOpen} onClose={handleCloseModal} job={selectedJob} />
          </div>
        </Container>
      </ProfileProvider>
    </ProtectedRoute>
  );
};

export default Dashboard;
