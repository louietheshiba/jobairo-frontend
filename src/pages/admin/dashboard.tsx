import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import AdminSidebar from '@/components/Admin/AdminSidebar';
import AdminStats from '@/components/Admin/AdminStats';
import AdminJobs from '@/components/Admin/AdminJobs';

const AdminDashboard = () => {
  const router = useRouter();
  const { user , userRole} = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // useEffect(() => {
  //   // Check admin authentication
  //   if (!user || userRole !== 'admin') {
  //     router.push('/auth/login');
  //     return;
  //   }
  // }, [user, userRole, router]);

  // if (!user || userRole !== 'admin') {
  //   return (
  //     <div className="min-h-screen bg-gray-100 flex items-center justify-center">
  //     </div>
  //   );
  // }

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
      case 'users':
        return (
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
            </div>
            {/* User management content will go here */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <p className="text-gray-600">User management interface coming soon...</p>
            </div>
          </div>
        );
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