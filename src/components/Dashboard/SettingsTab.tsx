import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/context/ProfileContext';
import { supabase } from '@/utils/supabase';
import toast from 'react-hot-toast';
import DeleteAccountModal from './DeleteAccountModal';

// Job types options
const JOB_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Freelance',
  'Internship',
  'Remote',
  'Hybrid',
  'On-site'
];



const SettingsTab: React.FC = () => {
  const { user } = useAuth();
  const { profile, loading, updateProfile } = useProfile();
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    location: '',
  });
  const [jobPreferences, setJobPreferences] = useState({
    desired_salary_min: '',
    desired_salary_max: '',
    job_types: [] as string[],
    preferred_locations: [] as string[],
  });
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Initialize form data when profile loads
  React.useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name,
        phone: profile.phone,
        location: profile.location,
      });
      
      // Initialize job preferences
      setJobPreferences({
        desired_salary_min: profile.job_preferences?.desired_salary_min ? profile.job_preferences.desired_salary_min.toString() : '',
        desired_salary_max: profile.job_preferences?.desired_salary_max ? profile.job_preferences.desired_salary_max.toString() : '',
        job_types: profile.job_preferences?.job_types || [],
        preferred_locations: profile.job_preferences?.preferred_locations || [],
      });
    }
  }, [profile]);

  const handleJobPreferenceChange = (field: string, value: any) => {
    setJobPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleJobType = (jobType: string) => {
    setJobPreferences(prev => ({
      ...prev,
      job_types: prev.job_types.includes(jobType)
        ? prev.job_types.filter(type => type !== jobType)
        : [...prev.job_types, jobType]
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);

    const success = await updateProfile({
      full_name: formData.full_name,
      phone: formData.phone,
      location: formData.location,
      job_preferences: {
        desired_salary_min: jobPreferences.desired_salary_min ? parseInt(jobPreferences.desired_salary_min) : undefined,
        desired_salary_max: jobPreferences.desired_salary_max ? parseInt(jobPreferences.desired_salary_max) : undefined,
        job_types: jobPreferences.job_types,
        preferred_locations: jobPreferences.preferred_locations,
      },
    });

    if (success) {
      toast.success('Profile updated successfully! 🎉');
    } else {
      toast.error('Error saving profile. Please try again.');
    }

    setSaving(false);
  };

  const handleCancel = () => {
    // Reset form data to current profile data
    setFormData({
      full_name: profile.full_name,
      phone: profile.phone,
      location: profile.location,
    });
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!user) return;

    setDeleting(true);

    try {
      console.log('Sending delete request for user:', user.id);
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      console.log('Delete response status:', response.status);

      let data;
      try {
        data = await response.json();
        console.log('Delete response data:', data);
      } catch (parseError) {
        console.error('Failed to parse response JSON:', parseError);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      toast.success('Account deactivated successfully. Redirecting...');
      // Sign out and redirect
      await supabase.auth.signOut();
      window.location.href = '/auth';
    } catch (error) {
      console.error('Error deleting account:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Error deleting account: ${errorMessage}`);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-10"></div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Account Settings</h3>


      <div className="space-y-6">
        {/* Profile Section */}
        <div className="bg-white dark:bg-dark-20 rounded-lg shadow-sm p-6">
          <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Profile Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-10 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-10 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-10 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Job Preferences Section */}
        <div className="bg-white dark:bg-dark-20 rounded-lg shadow-sm p-6">
          <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Job Preferences</h4>
          
          {/* Salary Range */}
          <div className="mb-6">
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Desired Salary Range</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Minimum ($)
                </label>
                <input
                  type="number"
                  value={jobPreferences.desired_salary_min}
                  onChange={(e) => handleJobPreferenceChange('desired_salary_min', e.target.value)}
                  placeholder="50000"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-10 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Maximum ($)
                </label>
                <input
                  type="number"
                  value={jobPreferences.desired_salary_max}
                  onChange={(e) => handleJobPreferenceChange('desired_salary_max', e.target.value)}
                  placeholder="100000"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-10 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Job Types */}
          <div className="mb-6">
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Preferred Job Types</h5>
            <div className="flex flex-wrap gap-2">
              {JOB_TYPES.map((jobType) => (
                <button
                  key={jobType}
                  type="button"
                  onClick={() => toggleJobType(jobType)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    jobPreferences.job_types.includes(jobType)
                      ? 'bg-primary-10 text-white hover:bg-primary-15'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {jobType}
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Locations */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Preferred Locations</h5>
            <input
              type="text"
              value={jobPreferences.preferred_locations.join(', ')}
              onChange={(e) => {
                const locations = e.target.value.split(',').map(loc => loc.trim()).filter(loc => loc);
                setJobPreferences(prev => ({
                  ...prev,
                  preferred_locations: locations
                }));
              }}
              placeholder="e.g., New York, Remote, San Francisco"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-10 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Separate multiple locations with commas
            </p>
          </div>
        </div>

        {/* Account Deletion */}
        <div className="bg-white dark:bg-dark-20 rounded-lg shadow-sm p-6">
          <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Account</h4>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h5 className="font-medium text-red-600 dark:text-red-400 mb-2">Deactivate Account</h5>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Deactivate your account and clear your data. You can contact support to reactivate if needed.
            </p>
            <button
              onClick={handleDeleteClick}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Deactivate Account
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-primary-10 text-white rounded-lg hover:bg-primary-15 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
      />
    </div>
  );
};

export default SettingsTab;