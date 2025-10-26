'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  LogOut,
  ArrowLeft,
  Sun,
  Moon,
  Menu,
  X,
} from 'lucide-react';
import { useTheme } from '@/context/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/utils/supabase';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, onTabChange }) => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { signOut } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [adminName, setAdminName] = useState<string>('Admin');

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // fetch name from profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', user.id)
          .single();

        if (!error && data?.full_name) {
          setAdminName(data.full_name);
        } else if (user.user_metadata?.full_name) {
          // fallback to metadata
          setAdminName(user.user_metadata.full_name);
        }
      } catch (err) {
        console.error('Error fetching admin info:', err);
      }
    };

    fetchAdmin();
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.push('/auth/login');
  };

  return (
    <>
      {/* 📱 Mobile Toggle */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md bg-gray-100 dark:bg-dark-30 hover:bg-gray-200 dark:hover:bg-dark-40"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* 🧭 Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 z-40 bg-white dark:bg-dark-20 shadow-lg transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-dark-30"
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <Link
                href="/"
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-dark-30"
                title="Back to Home"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Welcome, {adminName}
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 pb-10">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5 mr-3" /> },
            { id: 'jobs', label: 'Job Management', icon: <Briefcase className="w-5 h-5 mr-3" /> },
            { id: 'users', label: 'User Management', icon: <Users className="w-5 h-5 mr-3" /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center px-3 py-2 mt-1 text-left rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-[#10b981] to-[#047857] text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-30'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-left text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 md:hidden z-30"
        />
      )}
    </>
  );
};

export default AdminSidebar;
