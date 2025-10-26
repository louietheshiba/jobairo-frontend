import React, { useState, useEffect, useCallback } from 'react';
import { Eye as ViewIcon, Heart as SaveIcon, FileText as ApplyIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/utils/supabase';

const DashboardStats: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ viewed: 0, saved: 0, applied: 0 });

  const fetchStats = useCallback(async () => {
    if (!user?.id) return;

    try {
      const [viewed, saved, applied] = await Promise.all([
        supabase.from('job_views').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('saved_jobs').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('applied_jobs').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      ]);

      const newStats = {
        viewed: viewed.count || 0,
        saved: saved.count || 0,
        applied: applied.count || 0,
      };

      // Only update if values actually changed
      setStats((prev) =>
        prev.viewed !== newStats.viewed ||
        prev.saved !== newStats.saved ||
        prev.applied !== newStats.applied
          ? newStats
          : prev
      );
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchStats();

    const handleRefresh = () => fetchStats();
    window.addEventListener('statsRefresh', handleRefresh);

    return () => window.removeEventListener('statsRefresh', handleRefresh);
  }, [fetchStats]);

  const cardData = [
    {
      label: 'Jobs Viewed',
      value: stats.viewed,
      icon: <ViewIcon className="w-6 h-6 text-blue-600 dark:text-blue-300" />,
      bg: 'bg-blue-100 dark:bg-blue-900',
    },
    {
      label: 'Jobs Saved',
      value: stats.saved,
      icon: <SaveIcon className="w-6 h-6 text-red-600 dark:text-red-300" />,
      bg: 'bg-red-100 dark:bg-red-900',
    },
    {
      label: 'Jobs Applied',
      value: stats.applied,
      icon: <ApplyIcon className="w-6 h-6 text-green-600 dark:text-green-300" />,
      bg: 'bg-green-100 dark:bg-green-900',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {cardData.map(({ label, value, icon, bg }) => (
        <div
          key={label}
          className="bg-white p-6 rounded-lg shadow-sm dark:bg-dark-20 hover:shadow-md transition-all duration-200 cursor-pointer"
        >
          <div className="flex items-center">
            <div className={`p-2 rounded-lg transition-colors duration-200 ${bg}`}>{icon}</div>
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
