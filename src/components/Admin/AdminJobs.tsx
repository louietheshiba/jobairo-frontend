import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import {
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Upload,
  Plus,
  MoreHorizontal,
  CheckSquare,
  Square
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company?: { name: string } | string;
  location: string;
  department?: string;
  employment_type?: string;
  remote_type?: string;
  salary_range?: string;
  status: 'open' | 'closed' | 'hidden';
  date_posted?: string;
  created_at: string;
  experience_level?: string;
  job_category?: string;
  required_skills?: string;
  benefits?: string;
  visa_sponsorship?: string;
  equity_offered?: string;
  salary?: string;
}

const AdminJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter(job => {
        const companyName = typeof job.company === 'object' && job.company?.name
          ? job.company.name
          : typeof job.company === 'string'
          ? job.company
          : '';
        return job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
               companyName.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    setFilteredJobs(filtered);
  }, [jobs, searchTerm, statusFilter]);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          company:companies(name)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectJob = (jobId: string) => {
    setSelectedJobs(prev =>
      prev.includes(jobId)
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const handleSelectAll = () => {
    setSelectedJobs(
      selectedJobs.length === filteredJobs.length
        ? []
        : filteredJobs.map(job => job.id)
    );
  };

  const handleBulkAction = async (action: string) => {
    if (selectedJobs.length === 0) return;

    try {
      let updateData = {};

      switch (action) {
        case 'hide':
          updateData = { status: 'hidden' };
          break;
        case 'show':
          updateData = { status: 'open' };
          break;
        case 'delete':
          // Soft delete by setting status to closed
          updateData = { status: 'closed' };
          break;
      }

      const { error } = await supabase
        .from('jobs')
        .update(updateData)
        .in('id', selectedJobs);

      if (error) throw error;

      // Refresh jobs
      await fetchJobs();
      setSelectedJobs([]);
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  const handleJobAction = async (jobId: string, action: string) => {
    try {
      let updateData = {};

      switch (action) {
        case 'hide':
          updateData = { status: 'hidden' };
          break;
        case 'show':
          updateData = { status: 'open' };
          break;
        case 'delete':
          updateData = { status: 'closed' };
          break;
      }

      const { error } = await supabase
        .from('jobs')
        .update(updateData)
        .eq('id', jobId);

      if (error) throw error;

      await fetchJobs();
    } catch (error) {
      console.error('Error performing job action:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-red-100 text-red-800';
      case 'hidden': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10b981]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Job Management</h1>
        <div className="flex space-x-4">
          <button className="px-4 py-2 bg-[#10b981] text-white rounded-md hover:bg-[#047857] transition-colors">
            <Plus className="h-4 w-4 mr-2 inline" />
            Add Job
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <Upload className="h-4 w-4 mr-2 inline" />
            Import CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs by title or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10b981] focus:border-[#10b981] transition-colors"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10b981] focus:border-[#10b981] bg-white transition-colors"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="hidden">Hidden</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedJobs.length > 0 && (
        <div className="bg-[#10b981]/5 border border-[#10b981]/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#10b981] font-medium">
              {selectedJobs.length} job{selectedJobs.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex space-x-3">
              <button
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                onClick={() => handleBulkAction('show')}
              >
                <Eye className="h-4 w-4 mr-2 inline" />
                Show
              </button>
              <button
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                onClick={() => handleBulkAction('hide')}
              >
                <EyeOff className="h-4 w-4 mr-2 inline" />
                Hide
              </button>
              <button
                className="px-4 py-2 text-sm border border-red-300 rounded-lg text-red-700 bg-white hover:bg-red-50 transition-colors"
                onClick={() => handleBulkAction('delete')}
              >
                <Trash2 className="h-4 w-4 mr-2 inline" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Jobs Table */}
      <div className="bg-white dark:bg-dark-25 shadow-sm border border-gray-200 dark:border-dark-20 overflow-hidden sm:rounded-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 dark:bg-dark-20">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center hover:bg-gray-100 p-1 rounded"
                  >
                    {selectedJobs.length === filteredJobs.length && filteredJobs.length > 0 ? (
                      <CheckSquare className="h-4 w-4 text-[#10b981]" />
                    ) : (
                      <Square className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Job Title
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Posted
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-25 divide-y divide-gray-100 dark:divide-dark-20">
              {filteredJobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-dark-20 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleSelectJob(job.id)}
                      className="flex items-center hover:bg-gray-100 p-1 rounded transition-colors"
                    >
                      {selectedJobs.includes(job.id) ? (
                        <CheckSquare className="h-4 w-4 text-[#10b981]" />
                      ) : (
                        <Square className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{job.title}</div>
                    {job.department && (
                      <div className="text-xs text-gray-500">{job.department}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700 dark:text-gray-200 font-medium">
                      {typeof job.company === 'object' && job.company?.name
                        ? job.company.name
                        : typeof job.company === 'string'
                        ? job.company
                        : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600 dark:text-gray-300">{job.location}</div>
                    {job.remote_type && (
                      <div className="text-xs text-[#10b981] font-medium capitalize">{job.remote_type}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600 dark:text-gray-300 capitalize">{job.employment_type || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(job.date_posted || job.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-3">
                      <button
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        className="text-[#10b981] hover:text-[#047857] p-1 rounded hover:bg-green-50 transition-colors"
                        title="Edit Job"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {job.status === 'open' ? (
                        <button
                          className="text-yellow-600 hover:text-yellow-800 p-1 rounded hover:bg-yellow-50 transition-colors"
                          onClick={() => handleJobAction(job.id, 'hide')}
                          title="Hide Job"
                        >
                          <EyeOff className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50 transition-colors"
                          onClick={() => handleJobAction(job.id, 'show')}
                          title="Show Job"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                        onClick={() => handleJobAction(job.id, 'delete')}
                        title="Delete Job"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No jobs found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default AdminJobs;