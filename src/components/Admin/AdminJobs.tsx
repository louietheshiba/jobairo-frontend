import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import {
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  CheckSquare,
  Square,
  X
} from 'lucide-react';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';

interface Job {
  id: string;
  title: string;
  description?: string;
  company?: { name: string } | string;
  company_id?: string;
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
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);

  useEffect(() => {
    fetchJobs();
    fetchCompanies();
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

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
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
      toast.success(`${selectedJobs.length} job${selectedJobs.length > 1 ? 's' : ''} ${action}d successfully!`);
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast.error('Failed to perform bulk action. Please try again.');
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
      toast.success(`Job ${action}d successfully!`);
    } catch (error) {
      console.error('Error performing job action:', error);
      toast.error('Failed to perform action. Please try again.');
    }
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
  };

  const handleSaveJob = async (updatedJob: Partial<Job>) => {
    if (!editingJob) return;

    try {
      const { error } = await supabase
        .from('jobs')
        .update({
          title: updatedJob.title,
          description: updatedJob.description,
          location: updatedJob.location,
          department: updatedJob.department,
          employment_type: updatedJob.employment_type,
          remote_type: updatedJob.remote_type,
          salary_range: updatedJob.salary_range,
          company_id: updatedJob.company_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingJob.id);

      if (error) throw error;

      setEditingJob(null);
      await fetchJobs();
      toast.success('Job updated successfully! 🎉');
    } catch (error) {
      console.error('Error updating job:', error);
      toast.error('Failed to update job. Please try again.');
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
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 text-gray-400 z-10" />
              <Input
                type="text"
                placeholder="Search jobs by title or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 border-1 border-gray-300 rounded-lg focus:ring-1 focus:ring-[#10b981] focus:border-[#10b981] focus:shadow-lg transition-all duration-200"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <Select
              value={{ value: statusFilter, label: statusFilter === 'all' ? 'All Status' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1) }}
              onChange={(option: any) => setStatusFilter(option?.value || 'all')}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'open', label: 'Open' },
                { value: 'hidden', label: 'Hidden' },
                { value: 'closed', label: 'Closed' }
              ]}
              placeholder="Select Status"
            />
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
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 bg-gradient-to-r from-[#10b981] to-[#047857] text-white hover:shadow-lg transition-all duration-200"
                onClick={() => handleBulkAction('show')}
              >
                <Eye className="h-4 w-4 mr-2 inline" />
                Show
              </button>
              <button
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 bg-gradient-to-r from-[#10b981] to-[#047857] text-white hover:shadow-lg transition-all duration-200"
                onClick={() => handleBulkAction('hide')}
              >
                <EyeOff className="h-4 w-4 mr-2 inline" />
                Hide
              </button>
              <button
                className="px-4 py-2 text-sm border border-red-300 rounded-lg text-red-700 bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg transition-all duration-200"
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
                        className="text-[#10b981] hover:text-[#047857] p-1 rounded hover:bg-green-50 transition-colors"
                        title="Edit Job"
                        onClick={() => handleEditJob(job)}
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

      {/* Edit Job Modal */}
      {editingJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-25 rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Job</h2>
                <button
                  onClick={() => setEditingJob(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                const updatedJob = {
                  title: (e.target as any).title.value,
                  description: (e.target as any).description.value,
                  location: (e.target as any).location.value,
                  department: (e.target as any).department.value,
                  employment_type: (e.target as any).employment_type.value,
                  remote_type: (e.target as any).remote_type.value,
                  salary_range: (e.target as any).salary_range.value,
                  company_id: (e.target as any).company_id.value,
                };
                handleSaveJob(updatedJob);
              }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Job Title *
                    </label>
                    <Input
                      name="title"
                      defaultValue={editingJob.title}
                      required
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Company
                    </label>
                    <select
                      name="company_id"
                      defaultValue={editingJob.company_id || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10b981] focus:border-[#10b981] bg-white dark:bg-dark-25 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">Select Company</option>
                      {companies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Location *
                    </label>
                    <Input
                      name="location"
                      defaultValue={editingJob.location}
                      required
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Department
                    </label>
                    <Input
                      name="department"
                      defaultValue={editingJob.department || ''}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Employment Type
                    </label>
                    <Select
                      value={editingJob.employment_type ? { value: editingJob.employment_type, label: editingJob.employment_type.charAt(0).toUpperCase() + editingJob.employment_type.slice(1).replace('-', ' ') } : null}
                      onChange={(option: any) => {
                        const selectElement = document.querySelector('select[name="employment_type"]') as HTMLSelectElement;
                        if (selectElement) selectElement.value = option?.value || '';
                      }}
                      options={[
                        { value: 'full-time', label: 'Full Time' },
                        { value: 'part-time', label: 'Part Time' },
                        { value: 'contract', label: 'Contract' },
                        { value: 'internship', label: 'Internship' }
                      ]}
                      placeholder="Select Type"
                      className=" text-white"
                    />
                    <select
                      name="employment_type"
                      defaultValue={editingJob.employment_type || ''}
                      className="hidden"
                    >
                      <option value=""></option>
                      <option value="full-time">Full Time</option>
                      <option value="part-time">Part Time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Remote Type
                    </label>
                    <Select
                      value={editingJob.remote_type ? { value: editingJob.remote_type.toLowerCase(), label: editingJob.remote_type.charAt(0).toUpperCase() + editingJob.remote_type.slice(1).toLowerCase() } : null}
                      onChange={(option: any) => {
                        const selectElement = document.querySelector('select[name="remote_type"]') as HTMLSelectElement;
                        if (selectElement) selectElement.value = option?.value || '';
                      }}
                      options={[
                        { value: 'remote', label: 'Remote' },
                        { value: 'hybrid', label: 'Hybrid' },
                        { value: 'onsite', label: 'On-site' }
                      ]}
                      placeholder="Select Remote Type"
                      className=" text-white"
                    />
                    <select
                      name="remote_type"
                      defaultValue={editingJob.remote_type ? editingJob.remote_type.toLowerCase() : ''}
                      className="hidden"
                    >
                      <option value=""></option>
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="onsite">On-site</option>
                    </select>
                  </div>

                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    defaultValue={editingJob.description || ''}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10b981] focus:border-[#10b981] bg-white dark:bg-dark-25 dark:border-gray-600 dark:text-white"
                    placeholder="Job description..."
                  />
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setEditingJob(null)}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 dark:bg-dark-25 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm border border-transparent rounded-lg text-white bg-gradient-to-r from-[#10b981] to-[#047857] hover:shadow-lg transition-all duration-200"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No jobs found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default AdminJobs;

