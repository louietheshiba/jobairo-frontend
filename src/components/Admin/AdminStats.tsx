import React, { useState, useEffect } from 'react';
import { Users, Briefcase, Building, TrendingUp, BarChart3, PieChart, Activity } from 'lucide-react';
import { supabase } from '@/utils/supabase';

const AdminStats = () => {
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalUsers: 0,
    totalCompanies: 0
  });

  const [chartData, setChartData] = useState<{
    jobsByMonth: { month: string; count: number }[];
    usersByMonth: { month: string; count: number }[];
    applicationsByMonth: { month: string; count: number }[];
  }>({
    jobsByMonth: [],
    usersByMonth: [],
    applicationsByMonth: []
  });

  useEffect(() => {
    fetchStats();
    fetchChartData();
  }, []);

  const fetchStats = async () => {
    try {
      // Get total jobs
      const { count: totalJobs } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true });

      // Get total users (from profiles table since users table was removed)
      const { count: totalUsers } = await supabase
        .from('profiles')
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

  const fetchChartData = async () => {
    try {
      // Get jobs created by month (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data: jobsData } = await supabase
        .from('jobs')
        .select('created_at')
        .gte('created_at', sixMonthsAgo.toISOString());

      // Get users created by month (last 6 months)
      const { data: usersData } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', sixMonthsAgo.toISOString());

      // Get applications by month (last 6 months)
      const { data: applicationsData } = await supabase
        .from('applied_jobs')
        .select('created_at')
        .gte('created_at', sixMonthsAgo.toISOString());

      // Process data for charts
      const jobsByMonth = processMonthlyData(jobsData || []);
      const usersByMonth = processMonthlyData(usersData || []);
      const applicationsByMonth = processMonthlyData(applicationsData || []);

      setChartData({
        jobsByMonth,
        usersByMonth,
        applicationsByMonth
      });
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  const processMonthlyData = (data: any[]) => {
    const monthlyCounts: { [key: string]: number } = {};

    data.forEach(item => {
      const date = new Date(item.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyCounts[monthKey] = (monthlyCounts[monthKey] || 0) + 1;
    });

    return Object.entries(monthlyCounts).map(([month, count]) => ({
      month,
      count
    })).sort((a, b) => a.month.localeCompare(b.month));
  };

  const StatCard = ({ title, value, icon: Icon, color, change }: any) => (
    <div className="bg-white p-6 rounded-lg shadow-sm dark:bg-dark-20 hover:shadow-md transition-all duration-200 cursor-pointer">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${color} transition-colors duration-200`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value.toLocaleString()}</p>
          {change && (
            <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">{change}</p>
          )}
        </div>
      </div>
    </div>
  );

  const ChartCard = ({ title, icon: Icon, children }: any) => (
    <div className="bg-white dark:bg-dark-25 rounded-xl shadow-sm border border-gray-100 dark:border-dark-20 p-6">
      <div className="flex items-center mb-4">
        <div className="p-2 bg-green-100 rounded-lg dark:bg-green-900 mr-3">
          <Icon className="w-5 h-5 text-green-600 dark:text-green-300" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      {children}
    </div>
  );

  const SimpleBarChart = ({ data, color }: any) => (
    <div className="space-y-2">
      {data.slice(-6).map((item: any, index: number) => (
        <div key={index} className="flex items-center">
          <div className="w-16 text-xs text-gray-600 dark:text-gray-400">
            {new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short' })}
          </div>
          <div className="flex-1 ml-2">
            <div className="flex items-center">
              <div
                className={`h-3 rounded ${color}`}
                style={{ width: `${Math.max((item.count / Math.max(...data.map((d: any) => d.count))) * 100, 5)}%` }}
              ></div>
              <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">{item.count}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Jobs"
          value={stats.totalJobs}
          icon={Briefcase}
          color="bg-blue-100 dark:bg-blue-900"
          change="+12% from last month"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="bg-green-100 dark:bg-green-900"
          change="+8% from last month"
        />
        <StatCard
          title="Total Companies"
          value={stats.totalCompanies}
          icon={Building}
          color="bg-orange-100 dark:bg-orange-900"
          change="+5% from last month"
        />
      </div>


      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Jobs Created (Last 6 Months)" icon={BarChart3}>
          <SimpleBarChart data={chartData.jobsByMonth} color="bg-blue-500" />
        </ChartCard>

        <ChartCard title="Users Registered (Last 6 Months)" icon={Users}>
          <SimpleBarChart data={chartData.usersByMonth} color="bg-green-500" />
        </ChartCard>

        <ChartCard title="Applications Submitted (Last 6 Months)" icon={TrendingUp}>
          <SimpleBarChart data={chartData.applicationsByMonth} color="bg-purple-500" />
        </ChartCard>

        <ChartCard title="Platform Overview" icon={PieChart}>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Jobs</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.totalJobs}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Users</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.totalUsers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Companies</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.totalCompanies}</span>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

export default AdminStats;