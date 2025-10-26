import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AddUserModalProps {
  onClose: () => void;
  onSave: (data: { email: string; password: string; full_name: string; role: string }) => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ onClose, onSave }) => {
  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'job_seeker',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-dark-25 rounded-xl shadow-xl max-w-md w-full mx-4 animate-fadeIn p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add New User</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-700 dark:text-gray-300">Full Name</label>
            <input
              name="full_name"
              type="text"
              required
              value={form.full_name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-dark-25 dark:text-white"
            />
          </div>

          <div>
            <label className="text-sm text-gray-700 dark:text-gray-300">Email</label>
            <input
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-dark-25 dark:text-white"
            />
          </div>

          <div>
            <label className="text-sm text-gray-700 dark:text-gray-300">Password</label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-dark-25 dark:text-white"
            />
          </div>

          <div>
            <label className="text-sm text-gray-700 dark:text-gray-300">Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-dark-25 dark:text-white"
            >
              <option value="job_seeker">Job Seeker</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-[#10b981] to-[#047857] text-white rounded-lg hover:shadow-lg"
            >
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
