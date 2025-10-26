'use client';
import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Briefcase,
  Building,
  TrendingUp,
  BarChart3,
  PieChart,
} from 'lucide-react';
import { supabase } from '@/utils/supabase';

// --- Types ---
interface MonthlyData {
  month: string;
  count: number;
}

interface Stats {
  totalJobs: number;
  totalUsers: number;
  totalCompanies: number;
}

const AdminStats: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalJobs: 0,
    totalUsers: 0,
    totalCompanies: 0,
  });

  const [chartData, setChartData] = useState({
    jobsByMonth: [] as MonthlyData[],
    usersByMonth: [] as MonthlyData[],
    applicationsByMonth: [] as MonthlyData[],
  });

  useEffect(() => {
    (async () => {
      await Promise.all([fetchStats(), fetchChartData()]);
    })();
  }, []);

  /** 🔹 Fetch aggregated stats */
  const fetchStats = async () => {
    try {
      const [{ count: totalJobs }, { count: totalUsers }, { count: totalCompanies }] = await Promise.all([
        supabase.from('jobs').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('companies').select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        totalJobs: totalJobs ?? 0,
        totalUsers: totalUsers ?? 0,
        totalCompanies: totalCompanies ?? 0,
      });
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
    }
  };

  /** 🔹 Fetch monthly chart data (jobs, users, applications) */
  const fetchChartData = async () => {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const [jobs, users, applications] = await Promise.all([
        supabase.from('jobs').select('created_at').gte('created_at', sixMonthsAgo.toISOString()),
        supabase.from('profiles').select('created_at').gte('created_at', sixMonthsAgo.toISOString()),
        supabase.from('applied_jobs').select('created_at').gte('created_at', sixMonthsAgo.toISOString()),
      ]);

      setChartData({
        jobsByMonth: processMonthlyData(jobs.data || []),
        usersByMonth: processMonthlyData(users.data || []),
        applicationsByMonth: processMonthlyData(applications.data || []),
      });
    } catch (error) {
      console.error('❌ Error fetching chart data:', error);
    }
  };

  /** 🔹 Process records into monthly counts */
  const processMonthlyData = (data: any[]): MonthlyData[] => {
    const counts: Record<string, number> = {};
    data.forEach(({ created_at }) => {
      const d = new Date(created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      counts[key] = (counts[key] ?? 0) + 1;
    });
    return Object.entries(counts)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  /** 🔹 Subcomponents */
  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    change,
  }: {
    title: string;
    value: number;
    icon: React.ElementType;
    color: string;
    change?: string;
  }) => (
    <div className="bg-white dark:bg-dark-20 p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-transparent hover:border-green-500/20">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value.toLocaleString()}
          </p>
          {change && (
            <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">
              {change}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const ChartCard = ({
    title,
    icon: Icon,
    children,
  }: {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
  }) => (
    <div className="bg-white dark:bg-dark-25 rounded-xl shadow-sm border border-gray-100 dark:border-dark-20 p-6">
      <div className="flex items-center mb-4">
        <div className="p-2 bg-green-100 rounded-lg dark:bg-green-900 mr-3">
          <Icon className="w-5 h-5 text-green-600 dark:text-green-300" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );

  /** 🔹 Optimized chart rendering */
  const SimpleBarChart = ({
    data,
    color,
  }: {
    data: MonthlyData[];
    color: string;
  }) => {
    const maxCount = useMemo(() => Math.max(...data.map((d) => d.count), 1), [data]);

    return (
      <div className="space-y-2">
        {data.slice(-6).map((item, index) => (
          <div key={index} className="flex items-center">
            <div className="w-16 text-xs text-gray-600 dark:text-gray-400">
              {new Date(`${item.month}-01`).toLocaleDateString('en-US', {
                month: 'short',
              })}
            </div>
            <div className="flex-1 ml-2 flex items-center">
              <div
                className={`h-3 rounded ${color}`}
                style={{ width: `${Math.max((item.count / maxCount) * 100, 5)}%` }}
              ></div>
              <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">
                {item.count}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  /** 🔹 Render layout */
  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Jobs"
          value={stats.totalJobs}
          icon={Briefcase}
          color="bg-green-100 dark:bg-green-900"
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
          color="bg-green-100 dark:bg-green-900"
          change="+5% from last month"
        />
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Jobs Created (Last 6 Months)" icon={BarChart3}>
          <SimpleBarChart data={chartData.jobsByMonth} color="bg-green-500" />
        </ChartCard>

        <ChartCard title="Users Registered (Last 6 Months)" icon={Users}>
          <SimpleBarChart data={chartData.usersByMonth} color="bg-green-500" />
        </ChartCard>

        <ChartCard title="Applications Submitted (Last 6 Months)" icon={TrendingUp}>
          <SimpleBarChart
            data={chartData.applicationsByMonth}
            color="bg-green-500"
          />
        </ChartCard>

        <ChartCard title="Platform Overview" icon={PieChart}>
          <div className="space-y-4">
            {[
              { label: 'Total Jobs', value: stats.totalJobs },
              { label: 'Total Users', value: stats.totalUsers },
              { label: 'Total Companies', value: stats.totalCompanies },
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {item.label}
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {item.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

export default AdminStats;
