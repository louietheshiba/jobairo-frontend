import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import {
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  Plus,
  CheckSquare,
  Square,
  Mail,
  Phone,
  Calendar
} from 'lucide-react';

interface User {
  id: string;
  user_id: string;
  email: string;
  role: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  last_sign_in_at?: string;
  phone?: string;
  location?: string;
  bio?: string;
  status: 'active' | 'inactive' | 'suspended';
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      // First get profiles data
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (profilesError) throw profilesError;

      // Then get auth users data to get email addresses
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

      if (authError) throw authError;

      // Combine profiles with auth user emails
      const transformedUsers = (profilesData || []).map(profile => {
        const authUser = authUsers.users.find(user => user.id === profile.user_id);
        return {
          ...profile,
          email: authUser?.email || 'No email',
          last_sign_in_at: authUser?.last_sign_in_at,
          status: authUser?.last_sign_in_at ?
            (new Date(authUser.last_sign_in_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) ? 'active' : 'inactive') :
            'inactive'
        };
      });

      setUsers(transformedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    setSelectedUsers(
      selectedUsers.length === filteredUsers.length
        ? []
        : filteredUsers.map(user => user.id)
    );
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) return;

    try {
      let updateData = {};

      switch (action) {
        case 'activate':
          updateData = { status: 'active' };
          break;
        case 'suspend':
          updateData = { status: 'suspended' };
          break;
        case 'deactivate':
          updateData = { status: 'inactive' };
          break;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .in('id', selectedUsers);

      if (error) throw error;

      // Refresh users
      await fetchUsers();
      setSelectedUsers([]);
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      let updateData = {};

      switch (action) {
        case 'activate':
          updateData = { status: 'active' };
          break;
        case 'suspend':
          updateData = { status: 'suspended' };
          break;
        case 'deactivate':
          updateData = { status: 'inactive' };
          break;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

      if (error) throw error;

      await fetchUsers();
    } catch (error) {
      console.error('Error performing user action:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'job_seeker': return 'bg-blue-100 text-blue-800';
      case 'employer': return 'bg-orange-100 text-orange-800';
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
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <div className="flex space-x-4">
          <button className="px-4 py-2 bg-[#10b981] text-white rounded-md hover:bg-[#047857] transition-colors">
            <Plus className="h-4 w-4 mr-2 inline" />
            Add User
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
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10b981] focus:border-[#10b981] transition-colors"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10b981] focus:border-[#10b981] bg-white transition-colors"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="employer">Employer</option>
              <option value="job_seeker">Job Seeker</option>
            </select>
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10b981] focus:border-[#10b981] bg-white transition-colors"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="bg-[#10b981]/5 border border-[#10b981]/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#10b981] font-medium">
              {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex space-x-3">
              <button
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                onClick={() => handleBulkAction('activate')}
              >
                <Eye className="h-4 w-4 mr-2 inline" />
                Activate
              </button>
              <button
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                onClick={() => handleBulkAction('suspend')}
              >
                <EyeOff className="h-4 w-4 mr-2 inline" />
                Suspend
              </button>
              <button
                className="px-4 py-2 text-sm border border-red-300 rounded-lg text-red-700 bg-white hover:bg-red-50 transition-colors"
                onClick={() => handleBulkAction('deactivate')}
              >
                <Trash2 className="h-4 w-4 mr-2 inline" />
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
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
                    {selectedUsers.length === filteredUsers.length && filteredUsers.length > 0 ? (
                      <CheckSquare className="h-4 w-4 text-[#10b981]" />
                    ) : (
                      <Square className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-25 divide-y divide-gray-100 dark:divide-dark-20">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-dark-20 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleSelectUser(user.id)}
                      className="flex items-center hover:bg-gray-100 p-1 rounded transition-colors"
                    >
                      {selectedUsers.includes(user.id) ? (
                        <CheckSquare className="h-4 w-4 text-[#10b981]" />
                      ) : (
                        <Square className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {user.avatar_url ? (
                          <img className="h-10 w-10 rounded-full object-cover" src={user.avatar_url} alt="" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {user.full_name ? user.full_name.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U')}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {user.full_name || 'No name'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="text-xs text-gray-400 flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}
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
                        title="Edit User"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {user.status === 'active' ? (
                        <button
                          className="text-yellow-600 hover:text-yellow-800 p-1 rounded hover:bg-yellow-50 transition-colors"
                          onClick={() => handleUserAction(user.id, 'suspend')}
                          title="Suspend User"
                        >
                          <EyeOff className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50 transition-colors"
                          onClick={() => handleUserAction(user.id, 'activate')}
                          title="Activate User"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                        onClick={() => handleUserAction(user.id, 'deactivate')}
                        title="Deactivate User"
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

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No users found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;