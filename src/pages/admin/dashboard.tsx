import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import AdminSidebar from '@/components/Admin/AdminSidebar';
import AdminStats from '@/components/Admin/AdminStats';
import AdminJobs from '@/components/Admin/AdminJobs';
import AdminUsers from '@/components/Admin/AdminUsers';
import RelevantJobsTab from '@/components/Dashboard/RelevantJobsTab';

const AdminDashboard = () => {
   const router = useRouter();
   const { user, userRole, loading } = useAuth();
   console.log(userRole)
   const [activeTab, setActiveTab] = useState('dashboard');

   useEffect(() => {
     // Check admin authentication only after loading is complete
     if (!loading && (!user || userRole !== 'admin')) {
       router.push('/auth/login');
       return;
     }
   }, [user, userRole, loading, router]);

   // Show loading state while determining user role
   if (loading) {
     return (
       <div className="min-h-screen bg-gray-100 flex items-center justify-center">
         <div className="text-gray-600">Loading...</div>
       </div>
     );
   }

   if (!user || userRole !== 'admin') {
     return (
       <div className="min-h-screen bg-gray-100 flex items-center justify-center">
         <div className="text-gray-600">Access denied. Redirecting...</div>
       </div>
     );
   }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              {/* <p className="text-gray-600">Welcome back, {user.email}</p> */}
            </div>
            <AdminStats />
          </div>
        );
      case 'jobs':
        return <AdminJobs />;
      case 'relevant':
        return (
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Relevant Jobs</h1>
            </div>
            <RelevantJobsTab onCardClick={(job) => {
              // admin might want to view/edit the job — route to job admin page
              router.push(`/admin/jobs?jobId=${job.id}`);
            }} />
          </div>
        );
      case 'users':
        return <AdminUsers />;
      case 'moderation':
        return (
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Moderation Queue</h1>
            </div>
            {/* Moderation content will go here */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <p className="text-gray-600">Moderation queue interface coming soon...</p>
            </div>
          </div>
        );
      case 'content':
        return (
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Management</h1>
            </div>
            {/* Content management content will go here */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <p className="text-gray-600">Content management interface coming soon...</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            </div>
            <AdminStats />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="ml-64 p-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;