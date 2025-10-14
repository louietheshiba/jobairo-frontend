import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/context/ProfileContext';
import { supabase } from '@/utils/supabase';
import toast from 'react-hot-toast';
import DeleteAccountModal from './DeleteAccountModal';




const SettingsTab: React.FC = () => {
  const { user } = useAuth();
  const { profile, loading, updateProfile } = useProfile();
  const [formData, setFormData] = useState({
    full_name: '',
  });
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Initialize form data when profile loads
  React.useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name,
      });
      
    }
  }, [profile]);



  const handleSave = async () => {
    if (!user) return;

    setSaving(true);

    const success = await updateProfile({
      full_name: formData.full_name,
    });

    if (success) {
      // Clear relevant jobs cache so recommendations refresh with new preferences
      localStorage.removeItem('lastRelevantJobsFetch');
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
    });
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!user) return;

    setDeleting(true);

    try {
      const response = await fetch(`/api/user/delete?userId=${user.id}`, {
        method: 'DELETE',
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        // If JSON parsing fails, use the text as error
        throw new Error(`Server error: ${responseText || 'Unknown error'}`);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account');
      }

      toast.success('Account deleted successfully. Signing out...');

      // Wait a moment for the toast to be visible
      setTimeout(async () => {
        await supabase.auth.signOut();
        window.location.href = '/account-deleted';
      }, 2000);
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#282828] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
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
          </div>
        </div>


        {/* Account Management */}
        <div className="bg-white dark:bg-dark-20 rounded-lg shadow-sm p-6">
          <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Account Management</h4>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h5 className="font-medium text-red-600 dark:text-red-400 mb-2">Delete Account</h5>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <button
              onClick={handleDeleteClick}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete Account
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
            className="px-6 py-2  bg-[#10b981]  text-white rounded-[10px] shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
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