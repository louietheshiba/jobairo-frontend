'use client';
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { supabase } from '@/utils/supabase';
import toast from 'react-hot-toast';
import { User } from '../../../utils/userTypes';

interface EditUserModalProps {
  user: User;
  onClose: () => void;
  onUserUpdated: () => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  user,
  onClose,
  onUserUpdated,
}) => {
  const [formData, setFormData] = useState({
    full_name: user.full_name || '',
    role: user.role || 'job_seeker',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          role: formData.role,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      const response = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.user_id,
          metadata: {
            full_name: formData.full_name,
            role: formData.role,
          },
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to update auth metadata');

      toast.success('User updated successfully!');
      onUserUpdated();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to update user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-25 rounded-xl shadow-lg w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-[#10b981]"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Edit User
          </h2>

          <form onSubmit={handleUpdateUser} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Name
              </label>
              <Input
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="focus:ring-[#10b981] focus:border-[#10b981]"
              />
            </div>

            {/* Role Select */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Role
              </label>
              <Select
                value={{ value: formData.role, label: formData.role }}
                onChange={(option: any) =>
                  setFormData({ ...formData, role: option.value })
                }
                options={[
                  { value: 'admin', label: 'Admin' },
                  { value: 'job_seeker', label: 'Job Seeker' },
                ]}
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-[#10b981] text-white rounded-lg hover:bg-[#059669]"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
