import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/context/ProfileContext';

const DashboardStats: React.FC = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [stats, setStats] = useState({ viewed: 0, saved: 0, applied: 0 });
  const [prevStats, setPrevStats] = useState({ viewed: 0, saved: 0, applied: 0 });

  const fetchStats = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Use dummy data for now to match the design
      const newStats = {
        viewed: 127,
        saved: 12,
        applied: 23,
      };

      setStats(newStats);
      setPrevStats({ viewed: 113, saved: 11, applied: 21 }); // Previous week stats for percentage calculation
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

  const getFirstName = () => {
    const name = profile?.full_name || user?.email?.split('@')[0] || 'John';
    return name.split(' ')[0];
  };

  const cardData = [
    {
      label: "Jobs Viewed",
      value: 127,
      percentage: 12,
      bgGradient: "bg-[#f8fafc]",
    },
    {
      label: "Applications Sent",
      value: 23,
      percentage: 8,
      bgGradient: "bg-[#f8fafc]",
    },
    {
      label: "Profile Views",
      value: 89,
      percentage: 34,
      bgGradient: "bg-[#f8fafc]",
    },
    {
      label: "Response Rate",
      value: "18%",
      percentage: 3,
      bgGradient: "bg-[#f8fafc]",
      showImprovement: true,
    },
  ];

  return (
    <div className="mb-8">
      {/* Welcome Banner */}
      <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-[#10b981] via-[#059669] to-[#047857] p-8 shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mb-48"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            Welcome back, {getFirstName()}! 👋
          </h1>
          <p className="text-green-50 text-lg">
            You have <span className="font-semibold text-white">5</span> new job
            matches based on your profile
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {cardData.map(
          ({ label, value, percentage, bgGradient, showImprovement }) => (
            <div
              key={label}
              className={`relative overflow-hidden ${bgGradient} p-6 rounded-3xl border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:border-[#10b981] transition-all duration-300 hover:-translate-y-1`}
            >
              <div className="bg-[#22c55e] opacity-20 h-[120px] w-[120px] rounded-full absolute -top-[50px] -right-[50px]"></div>
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {label}
                  </span>
                </div>
                <div className="flex items-end justify-between mt-auto">
                  <div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      {value}
                    </p>
                    <div className="flex items-center gap-1 text-sm">
                      <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {percentage > 0 ? "+" : ""}
                        {percentage}%
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">
                        {showImprovement ? "improvement" : "this week"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default DashboardStats;
