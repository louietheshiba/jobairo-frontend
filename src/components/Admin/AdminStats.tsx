import React, { useState, useEffect } from 'react';
import { Users, Briefcase, Building, TrendingUp } from 'lucide-react';
import { supabase } from '@/utils/supabase';

const AdminStats = () => {
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalUsers: 0,
    totalCompanies: 0
  });


  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Get total jobs
      const { count: totalJobs } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true });

      // Get total users
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Get total companies
      const { count: totalCompanies } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalJobs: totalJobs || 0,
        totalUsers: totalUsers || 0,
        totalCompanies: totalCompanies || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, change }: any) => (
    <div className="bg-white dark:bg-dark-25 rounded-xl shadow-sm border border-gray-100 dark:border-dark-20 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value.toLocaleString()}</p>
          {change && (
            <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">{change}</p>
          )}
        </div>
        <div className={`p-4 rounded-xl ${color}`}>
          <Icon className="h-7 w-7 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Jobs"
          value={stats.totalJobs}
          icon={Briefcase}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          change="+12% from last month"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="bg-gradient-to-br from-green-500 to-green-600"
          change="+8% from last month"
        />
        <StatCard
          title="Total Companies"
          value={stats.totalCompanies}
          icon={Building}
          color="bg-gradient-to-br from-orange-500 to-orange-600"
          change="+5% from last month"
        />
      </div>

      {/* Charts Section - Coming Soon */}
      <div className="bg-white dark:bg-dark-25 rounded-xl shadow-sm border border-gray-100 dark:border-dark-20 p-8">
        <div className="text-center">
          <TrendingUp className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Analytics Charts</h3>
          <p className="text-gray-600 dark:text-gray-400">Interactive charts and analytics coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;