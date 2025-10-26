'use client';
import React, { useState } from 'react';
import { supabase } from '@/utils/supabase';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import LocationAutocomplete from '@/components/ui/LocationAutocomplete';

interface EditJobModalProps {
  job: any;
  onClose: () => void;
  companies: any[];
  onSuccess: () => void;
}

const EditJobModal: React.FC<EditJobModalProps> = ({ job, onClose, companies, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  // Preload existing location (string to array)
  const [locations, setLocations] = useState<string[]>(job.location ? [job.location] : []);

  // Salary input states
  const [minSalary, setMinSalary] = useState(job.salary_range?.split('-')[0]?.trim() || '');
  const [maxSalary, setMaxSalary] = useState(job.salary_range?.split('-')[1]?.trim() || '');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const form = e.target as HTMLFormElement;
    const salaryRange = minSalary && maxSalary ? `${minSalary} - ${maxSalary}` : '';

    const updatedJob = {
      title: (form.title as any).value,
      location: locations[0] || '',
      description: (form.description as any).value,
      company_id: (form.company_id as any).value,
      employment_type: (form.employment_type as any).value,
      remote_type: (form.remote_type as any).value,
      salary_range: salaryRange,
      application_url: (form.application_url as any).value,
      updated_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase.from('jobs').update(updatedJob).eq('id', job.id);
      if (error) throw error;
      toast.success('Job updated successfully!');
      onClose();
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update job.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-dark-25 rounded-xl shadow-xl max-w-2xl w-full mx-4 animate-fadeIn">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Job</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleUpdate} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Job Title */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Job Title *</label>
              <Input
                name="title"
                defaultValue={job.title}
                required
                className="focus:ring-2 focus:ring-[#10b981] border-gray-300 dark:bg-dark-25 dark:text-white"
              />
            </div>

            {/* Company */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Company *</label>
              <select
                name="company_id"
                defaultValue={job.company_id}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#10b981] dark:bg-dark-25 dark:text-white"
              >
                <option value="">Select Company</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* ✅ Location Autocomplete */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Location *</label>
              <LocationAutocomplete
                value={locations}
                onChange={setLocations}
                isMulti={false}
                placeholder="Start typing a country, state, or city..."
                className="text-black dark:text-white mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Start typing a country, state, or city — dropdown will appear.
              </p>
            </div>

            {/* Employment Type */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Employment Type</label>
              <select
                name="employment_type"
                defaultValue={job.employment_type || ''}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#10b981] dark:bg-dark-25 dark:text-white"
              >
                <option value="">Select Type</option>
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            {/* Remote Type */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Remote Type</label>
              <select
                name="remote_type"
                defaultValue={job.remote_type || ''}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#10b981] dark:bg-dark-25 dark:text-white"
              >
                <option value="">Select Remote Type</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
              </select>
            </div>

            {/* Salary Range */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Salary Range</label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Min (e.g. $2000)"
                  value={minSalary}
                  onChange={(e) => setMinSalary(e.target.value)}
                  className="focus:ring-2 focus:ring-[#10b981] border-gray-300 dark:bg-dark-25 dark:text-white"
                />
                <Input
                  type="text"
                  placeholder="Max (e.g. $4000)"
                  value={maxSalary}
                  onChange={(e) => setMaxSalary(e.target.value)}
                  className="focus:ring-2 focus:ring-[#10b981] border-gray-300 dark:bg-dark-25 dark:text-white"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                These will be stored together as <code>“min - max”</code> in database.
              </p>
            </div>
          </div>

          {/* Application URL */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Application URL *</label>
            <Input
              name="application_url"
              defaultValue={job.application_url}
              required
              className="focus:ring-2 focus:ring-[#10b981] border-gray-300 dark:bg-dark-25 dark:text-white"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description *</label>
           <textarea
  name="description"
  defaultValue={job.description}
  required
  rows={4}
  className="w-full border border-gray-300 rounded-lg px-3 py-2 
             focus:ring-2 focus:ring-[#10b981] focus:border-[#10b981] 
             outline-none transition-all 
             dark:bg-dark-25 dark:text-white"
/>

          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#10b981] to-[#047857] text-white hover:shadow-lg transition"
            >
              {loading ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditJobModal;
