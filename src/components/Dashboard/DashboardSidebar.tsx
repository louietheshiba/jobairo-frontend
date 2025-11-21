'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Heart,
  FileText,
  EyeOff,
  Search,
  Eye,
  Settings,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  Target,
  BarChart3,
  Inbox,
} from 'lucide-react';
import { useTheme } from '@/context/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/context/ProfileContext';
import { supabase } from '@/utils/supabase';

interface DashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ activeTab, onTabChange }) => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { signOut, user } = useAuth();
  const { profile } = useProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [counts, setCounts] = useState({
    relevant: 0,
    saved: 0,
    applied: 0,
    viewed: 0,
    searches: 0,
    hidden: 0,
  });

  const fetchCounts = useCallback(async () => {
    // Use dummy data to match the design
    setCounts({
      relevant: 24,
      saved: 12,
      applied: 8,
      viewed: 0,
      searches: 3,
      hidden: 0,
    });
  }, []);

  useEffect(() => {
    fetchCounts();

    const handleRefresh = () => fetchCounts();
    window.addEventListener('statsRefresh', handleRefresh);

    return () => window.removeEventListener('statsRefresh', handleRefresh);
  }, [fetchCounts]);

  const handleLogout = async () => {
    await signOut();
  };

  const menuItems = [
    { id: 'relevant', label: 'Recommended', icon: <Target className="w-5 h-5" />, count: counts.relevant, color: 'bg-green-500' },
    { id: 'saved', label: 'Saved Jobs', icon: <Heart className="w-5 h-5" />, count: counts.saved, color: 'bg-green-500' },
    { id: 'applied', label: 'Applied', icon: <Inbox className="w-5 h-5" />, count: counts.applied, color: 'bg-green-500' },
    { id: 'viewed', label: 'Recently Viewed', icon: <Eye className="w-5 h-5" />, count: counts.viewed, color: 'bg-gray-500' },
    { id: 'searches', label: 'Saved Searches', icon: <Search className="w-5 h-5" />, count: counts.searches, color: 'bg-green-500' },
    { id: 'hidden', label: 'Hidden Jobs', icon: <EyeOff className="w-5 h-5" />, count: counts.hidden, color: 'bg-gray-500' },
    { id: 'stats', label: 'My Stats', icon: <BarChart3 className="w-5 h-5" />, count: null, color: '' },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      {/* <div className="md:hidden fixed top-24 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg bg-white dark:bg-dark-30 shadow-md hover:shadow-lg transition-shadow"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div> */}

      {/* Sidebar */}
      <aside>
        {/* Header */}
        {/* <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-30 transition-colors"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div> */}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-3.5 text-left rounded-2xl transition-all group ${
                activeTab === item.id
                  ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                  : "text-gray-600 hover:bg-green-50 hover:text-green-600 dark:text-gray-400 dark:hover:bg-green-900/20 dark:hover:text-green-400 hover:border-l-4 hover:border-green-500"
              }`}
            >
              <div className="flex items-center justify-between gap-5">
                <div
                  className={`transition-colors ${
                    activeTab === item.id
                      ? "text-green-600 dark:text-green-400"
                      : "text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400"
                  }`}
                >
                  {item.icon}
                </div>
                <span className="hover:font-semibold text-base">
                  {item.label}
                </span>
              </div>
              {item.count !== null && item.count > 0 && (
                <span
                  className={`min-w-[32px] h-8 px-3 flex items-center justify-center text-sm  rounded-full ${
                    activeTab === item.id
                      ? "bg-green-600 text-white"
                      : "bg-green-600 text-white group-hover:bg-green-600 group-hover:text-white"
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Settings & Logout */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
          <button
            onClick={() => {
              onTabChange("settings");
              setIsOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3.5 text-left rounded-2xl transition-colors group ${
              activeTab === "settings"
                ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                : "text-gray-600 hover:bg-green-50 hover:text-green-600 dark:text-gray-400 dark:hover:bg-green-900/20 dark:hover:text-green-400"
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="font-semibold text-base">Settings</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-2xl transition-colors group"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-semibold text-base">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;
