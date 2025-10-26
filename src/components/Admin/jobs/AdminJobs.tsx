'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import toast from 'react-hot-toast';
import JobFilters from './JobFilters';
import BulkActions from './BulkActions';
import JobTable from './JobTable';
import AddJobModal from './AddJobModal';
import EditJobModal from './EditJobModal';
import { getStatusColor } from '../../../utils/jobHelpers';
import { Plus, Building2 } from 'lucide-react';

const AdminJobs = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [editingJob, setEditingJob] = useState<any | null>(null);
  const [addingJob, setAddingJob] = useState(false);
  const [addingCompany, setAddingCompany] = useState(false);
  const [totalJobs, setTotalJobs] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
    fetchCompanies();
  }, []);

  const fetchJobs = async (loadMore = false) => {
    try {
      const rangeStart = loadMore ? jobs.length : 0;
      const rangeEnd = rangeStart + 49;
      const { data, error, count } = await supabase
        .from('jobs')
        .select(`*, company:companies(name)`, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(rangeStart, rangeEnd);

      if (error) throw error;
      if (loadMore) setJobs(prev => [...prev, ...(data || [])]);
      else setJobs(data || []);
      setTotalJobs(count || 0);
      setHasMore((rangeEnd + 1) < (count || 0));
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    const { data, error } = await supabase.from('companies').select('id, name').order('name');
    if (!error) setCompanies(data || []);
  };

  const handleBulkAction = async (action: 'hide' | 'show' | 'delete') => {
    if (!selectedJobs.length) return;
    const statusMap = { hide: 'hidden', show: 'open', delete: 'closed' };
    const { error } = await supabase
      .from('jobs')
      .update({ status: statusMap[action] })
      .in('id', selectedJobs);
    if (!error) {
      toast.success(`${selectedJobs.length} job(s) ${action}d successfully!`);
      setSelectedJobs([]);
      fetchJobs();
    }
  };

  const filtered = jobs.filter(job => {
    const matchSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (typeof job.company === 'object' && job.company?.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchSearch && matchStatus;
  });

  useEffect(() => setFilteredJobs(filtered), [jobs, searchTerm, statusFilter]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-black">
        <div className="h-12 w-12 border-b-2 border-[#10b981] rounded-full animate-spin"></div>
      </div>
    );

  // ✅ Add Company handler
  const handleAddCompany = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;

    if (!name.trim()) return toast.error('Company name is required');
    const { error } = await supabase.from('companies').insert([{ name }]);
    if (error) {
      toast.error('Failed to add company');
    } else {
      toast.success('Company added successfully!');
      form.reset();
      setAddingCompany(false);
      fetchCompanies();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Job Management</h1>
          <p className="text-sm text-gray-500">
            Showing {filteredJobs.length} of {totalJobs} jobs
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setAddingCompany(true)}
            className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-[#10b981] to-[#047857] flex items-center gap-2 hover:shadow-lg transition"
          >
            <Building2 className="h-4 w-4" /> Add Company
          </button>
          <button
            onClick={() => setAddingJob(true)}
            className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-[#10b981] to-[#047857] flex items-center gap-2 hover:shadow-lg transition"
          >
            <Plus className="h-4 w-4" /> Add Job
          </button>
        </div>
      </div>

      {/* Filters */}
      <JobFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {/* Bulk Actions */}
      {selectedJobs.length > 0 && (
        <BulkActions
          selectedCount={selectedJobs.length}
          onAction={handleBulkAction}
        />
      )}

      {/* Job Table */}
      <JobTable
        jobs={filteredJobs}
        hasMore={hasMore}
        fetchMore={() => fetchJobs(true)}
        selectedJobs={selectedJobs}
        setSelectedJobs={setSelectedJobs}
        onEdit={setEditingJob}
        onStatusChange={fetchJobs}
        getStatusColor={getStatusColor}
      />

      {/* Add Job Modal */}
      {addingJob && (
        <AddJobModal
          onClose={() => setAddingJob(false)}
          companies={companies}
          onSuccess={fetchJobs}
        />
      )}

      {/* Edit Job Modal */}
      {editingJob && (
        <EditJobModal
          job={editingJob}
          onClose={() => setEditingJob(null)}
          companies={companies}
          onSuccess={fetchJobs}
        />
      )}

      {/* ✅ Add Company Modal */}
      {addingCompany && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Add New Company
            </h2>
            <form onSubmit={handleAddCompany} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Company Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter company name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setAddingCompany(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-[#10b981] hover:bg-[#059669] rounded-lg"
                >
                  Save Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJobs;
