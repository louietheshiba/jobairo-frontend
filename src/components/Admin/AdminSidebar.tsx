import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  LayoutDashboard,
  Briefcase,
  TrendingUp,
  Users,
  LogOut,
  ArrowLeft,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '@/context/useTheme';
import { useAuth } from '@/hooks/useAuth';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, onTabChange }) => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push('/auth/login');
  };

  return (
    <div className={`w-64 border-r shadow-sm flex flex-col fixed left-0 top-0 h-screen z-10 ${
      isDarkMode ? 'bg-dark-25 border-dark-20' : 'bg-white border-gray-200'
    }`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Admin Panel
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className={`p-2 transition-colors ${
                isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link href="/" className={`p-2 transition-colors ${
              isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}>
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </div>
        </div>
        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Welcome Admin!
        </p>
      </div>

      <nav className="mt-6">
        <div className="px-3 pb-10">

          <button
            onClick={() => onTabChange('dashboard')}
            className={`w-full flex items-center px-3 py-2 mt-1 text-left rounded-lg transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-[#10b981] text-white shadow-md'
                : isDarkMode
                ? 'text-gray-300 hover:bg-[#10b981]/10 hover:text-[#10b981]'
                : 'text-gray-700 hover:bg-[#10b981]/10 hover:text-[#10b981]'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Dashboard
          </button>

          <button
            onClick={() => onTabChange('jobs')}
            className={`w-full flex items-center px-3 py-2 mt-1 text-left rounded-lg transition-colors ${
              activeTab === 'jobs'
                ? 'bg-[#10b981] text-white shadow-md'
                : isDarkMode
                ? 'text-gray-300 hover:bg-[#10b981]/10 hover:text-[#10b981]'
                : 'text-gray-700 hover:bg-[#10b981]/10 hover:text-[#10b981]'
            }`}
          >
            <Briefcase className="w-5 h-5 mr-3" />
            Job Management
          </button>

          <button
            onClick={() => onTabChange('relevant')}
            className={`w-full flex items-center px-3 py-2 mt-1 text-left rounded-lg transition-colors ${
              activeTab === 'relevant'
                ? 'bg-[#10b981] text-white shadow-md'
                : isDarkMode
                ? 'text-gray-300 hover:bg-[#10b981]/10 hover:text-[#10b981]'
                : 'text-gray-700 hover:bg-[#10b981]/10 hover:text-[#10b981]'
            }`}
          >
            <TrendingUp className="w-5 h-5 mr-3" />
            Relevant Jobs
          </button>

          <button
            onClick={() => onTabChange('users')}
            className={`w-full flex items-center px-3 py-2 mt-1 text-left rounded-lg transition-colors ${
              activeTab === 'users'
                ? 'bg-[#10b981] text-white shadow-md'
                : isDarkMode
                ? 'text-gray-300 hover:bg-[#10b981]/10 hover:text-[#10b981]'
                : 'text-gray-700 hover:bg-[#10b981]/10 hover:text-[#10b981]'
            }`}
          >
            <Users className="w-5 h-5 mr-3" />
            User Management
          </button>

        </div>

        {/* Logout Button */}
        <div className={`mt-auto p-6 border-t ${
          isDarkMode ? 'border-dark-20' : 'border-gray-200'
        }`}>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
              isDarkMode
                ? 'text-gray-300 hover:bg-red-900/20 hover:text-red-400'
                : 'text-gray-700 hover:bg-red-50 hover:text-red-600'
            }`}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </nav>
    </div>
  );
};

export default AdminSidebar;