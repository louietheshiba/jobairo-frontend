import React from 'react';
import Link from 'next/link';
import { Home, Heart, FileText, EyeOff, Search, Eye, Settings, LogOut, ArrowLeft, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/context/ProfileContext';

interface DashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ activeTab, onTabChange }) => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { signOut } = useAuth();
  const { profile } = useProfile();

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/auth';
  };

  return (
    <div className="w-64 bg-white shadow-lg dark:bg-dark-20 flex flex-col fixed left-0 top-0 h-screen z-10">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link href="/" className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">Welcome {profile.full_name}!</p>
      </div>

      <nav className="mt-6">
        <div className="px-3">
          <button
            onClick={() => onTabChange('relevant')}
            className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${activeTab === 'relevant'
                ? 'bg-primary-10 text-white'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-30'
              }`}
          >
            <Home className="w-5 h-5 mr-3" />
            Relevant Jobs
          </button>

          <button
            onClick={() => onTabChange('saved')}
            className={`w-full flex items-center px-3 py-2 mt-1 text-left rounded-lg transition-colors ${activeTab === 'saved'
                ? 'bg-primary-10 text-white'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-30'
              }`}
          >
            <Heart className="w-5 h-5 mr-3" />
            Saved Jobs
          </button>

          <button
            onClick={() => onTabChange('applied')}
            className={`w-full flex items-center px-3 py-2 mt-1 text-left rounded-lg transition-colors ${activeTab === 'applied'
                ? 'bg-primary-10 text-white'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-30'
              }`}
          >
            <FileText className="w-5 h-5 mr-3" />
            Applied Jobs
          </button>

          <button
            onClick={() => onTabChange('hidden')}
            className={`w-full flex items-center px-3 py-2 mt-1 text-left rounded-lg transition-colors ${activeTab === 'hidden'
                ? 'bg-primary-10 text-white'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-30'
              }`}
          >
            <EyeOff className="w-5 h-5 mr-3" />
            Hidden Jobs
          </button>

          <button
            onClick={() => onTabChange('searches')}
            className={`w-full flex items-center px-3 py-2 mt-1 text-left rounded-lg transition-colors ${activeTab === 'searches'
                ? 'bg-primary-10 text-white'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-30'
              }`}
          >
            <Search className="w-5 h-5 mr-3" />
            Saved Searches
          </button>

          <button
            onClick={() => onTabChange('viewed')}
            className={`w-full flex items-center px-3 py-2 mt-1 text-left rounded-lg transition-colors ${activeTab === 'viewed'
                ? 'bg-primary-10 text-white'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-30'
              }`}
          >
            <Eye className="w-5 h-5 mr-3" />
            Recently Viewed
          </button>

          <button
            onClick={() => onTabChange('settings')}
            className={`w-full flex items-center px-3 py-2 mt-1 text-left rounded-lg transition-colors ${activeTab === 'settings'
                ? 'bg-primary-10 text-white'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-30'
              }`}
          >
            <Settings className="w-5 h-5 mr-3" />
            Settings
          </button>
        </div>

        {/* Logout Button */}
        <div className="mt-auto p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-left text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-30 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </nav>
    </div>
  );
};

export default DashboardSidebar;