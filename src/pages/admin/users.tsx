import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import AdminSidebar from '@/components/Admin/AdminSidebar';
import AdminUsers from '@/components/Admin/AdminUsers';

const AdminUsersPage = () => {
  const router = useRouter();
  const { user, userRole } = useAuth();
  const [activeTab, setActiveTab] = useState('users');

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
      <AdminUsers />
    </div>
  );
};

export default AdminUsersPage;