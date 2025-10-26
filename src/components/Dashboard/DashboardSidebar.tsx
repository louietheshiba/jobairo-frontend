'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import {
  Heart,
  FileText,
  EyeOff,
  Search,
  Eye,
  Settings,
  LogOut,
  ArrowLeft,
  Sun,
  Moon,
  Menu,
  X,
} from 'lucide-react';
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
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <>
      {/* Mobile Toggle */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md bg-gray-100 dark:bg-dark-30 hover:bg-gray-200 dark:hover:bg-dark-40"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 z-40 bg-white dark:bg-dark-20 shadow-lg transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
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
            Welcome {profile?.full_name || 'User'}!
            
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 pb-10">
          {[
            { id: 'saved', label: 'Saved Jobs', icon: <Heart className="w-5 h-5 mr-3" /> },
            { id: 'relevant', label: 'Relevant Jobs', icon: <Search className="w-5 h-5 mr-3" /> },
            { id: 'applied', label: 'Applied Jobs', icon: <FileText className="w-5 h-5 mr-3" /> },
            { id: 'hidden', label: 'Hidden Jobs', icon: <EyeOff className="w-5 h-5 mr-3" /> },
            { id: 'searches', label: 'Saved Searches', icon: <Search className="w-5 h-5 mr-3" /> },
            { id: 'viewed', label: 'Recently Viewed', icon: <Eye className="w-5 h-5 mr-3" /> },
            { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5 mr-3" /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center px-3 py-2 mt-1 text-left rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'bg-primary-10 text-white'
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
    </>
  );
};

export default DashboardSidebar;
