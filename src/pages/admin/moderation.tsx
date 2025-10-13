import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import AdminSidebar from '@/components/Admin/AdminSidebar';

const AdminModerationPage = () => {
  const router = useRouter();
  const { user, userRole } = useAuth();
  const [activeTab, setActiveTab] = useState('moderation');

  useEffect(() => {
    // Check admin authentication
    if (!user || userRole !== 'admin') {
      router.push('/auth/login');
      return;
    }
  }, [user, userRole, router]);

  if (!user || userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="ml-64 p-8">
        <h1 className="text-2xl font-bold text-gray-900">Moderation</h1>
        <p className="text-gray-600 mt-2">Moderate content and user reports.</p>
      </div>
    </div>
  );
};

export default AdminModerationPage;