import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/context/ProfileContext';
import { supabase } from '@/utils/supabase';
import toast from 'react-hot-toast';
import DeleteAccountModal from './DeleteAccountModal';

const SettingsTab: React.FC = () => {
  const { user } = useAuth();
  const { profile, loading, updateProfile } = useProfile();

  const [formData, setFormData] = useState({ full_name: '' });
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /** 🧠 Initialize form data from profile */
  useEffect(() => {
    if (profile) {
      setFormData({ full_name: profile.full_name });
    }
  }, [profile]);

  /** 💾 Save updated profile */
  const handleSave = useCallback(async () => {
    if (!user) return;
    if (!formData.full_name.trim()) {
      toast.error('Full name cannot be empty.');
      return;
    }

    setSaving(true);
    const success = await updateProfile({ full_name: formData.full_name.trim() });

    if (success) {
      localStorage.removeItem('lastRelevantJobsFetch');
      toast.success('Profile updated successfully 🎉');
    } else {
      toast.error('Failed to update profile.');
    }
    setSaving(false);
  }, [user, formData, updateProfile]);

  /** 🔁 Reset form */
  const handleCancel = useCallback(() => {
    if (profile) {
      setFormData({ full_name: profile.full_name });
      toast('Changes discarded.', { icon: '↩️' });
    }
  }, [profile]);

  /** 🗑️ Delete account flow */
  const handleDeleteConfirm = useCallback(async () => {
    if (!user) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/user/delete?userId=${user.id}`, { method: 'DELETE' });
      const text = await res.text();
      const data = JSON.parse(text || '{}');

      if (!res.ok) throw new Error(data.error || text || 'Failed to delete account.');

      toast.success('Account deleted. Signing out...');
      setTimeout(async () => {
        await supabase.auth.signOut();
        window.location.href = '/account-deleted';
      }, 1800);
    } catch (err) {
      console.error(err);
      toast.error(`Error deleting account: ${(err as Error).message}`);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  }, [user]);

  /** 🌀 Loading state */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-10" />
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Account Settings</h3>

      {/* Profile Info Section */}
      <div className="bg-white dark:bg-dark-20 rounded-xl shadow-sm  p-4 sm:p-6 mb-8 border border-gray-100 dark:border-gray-700 transition-all">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile Information</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Enter your full name"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-[#282828] text-gray-900 dark:text-white 
                         focus:ring-2 focus:ring-primary-10 focus:border-transparent 
                         transition-all duration-200"
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
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                         bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 
                         cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed</p>
          </div>
        </div>
      </div>

      {/* Account Management */}
      <div className="bg-white dark:bg-dark-20 rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 dark:border-gray-700 transition-all">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Management</h4>
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h5 className="font-medium text-red-600 dark:text-red-400 mb-2">Delete Account</h5>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white 
                       rounded-lg transition-all duration-300 focus:ring-2 
                       focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-dark-20"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end flex-wrap gap-3 mt-8">
        <button
          onClick={handleCancel}
          className="px-5 py-2 border border-gray-300 dark:border-gray-600 
                     text-gray-700 dark:text-gray-300 rounded-lg 
                     hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 
                     text-white font-medium rounded-lg shadow-md hover:shadow-lg 
                     transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Delete Confirmation Modal */}
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
