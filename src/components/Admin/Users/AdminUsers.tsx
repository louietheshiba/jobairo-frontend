'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import toast from 'react-hot-toast';
import { User } from '../../../utils/userTypes';
import UserFilters from './UserFilters';
import BulkActionsBar from './BulkActionsBar';
import UserTable from './UserTable';
import EditUserModal from './EditUserModal';
import AddUserModal from './AddUserModal';

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [addingUser, setAddingUser] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // ✅ Fetch users from the view
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setCurrentUserId(currentUser?.id || null);

      const { data, error } = await supabase
        .from('user_profiles') // view that joins auth + profiles
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const usersData = (data || []).map((u) => ({
        ...u,
        status: u.is_blocked ? 'suspended' : 'active',
      }));

      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Search & filter logic
  useEffect(() => {
    let filtered = [...users];
    if (searchTerm) {
      filtered = filtered.filter(
        (u) =>
          u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (roleFilter !== 'all') filtered = filtered.filter((u) => u.role === roleFilter);
    if (statusFilter !== 'all') filtered = filtered.filter((u) => u.status === statusFilter);
    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter]);

  // ✅ Bulk Actions
  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) return;

    if (currentUserId && selectedUsers.includes(currentUserId)) {
      toast.error("You can't perform this action on your own account!");
      return;
    }

    try {
      const is_blocked = action === 'suspend' || action === 'deactivate';
      const { error } = await supabase
        .from('profiles')
        .update({ is_blocked })
        .in('id', selectedUsers);

      if (error) throw error;

      toast.success(`${selectedUsers.length} user(s) updated successfully`);
      setSelectedUsers([]);
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error('Failed to perform bulk action.');
    }
  };

  // ✅ Add new user (admin-level signup)
  const handleAddUser = async (newUser: any) => {
    try {
      // 1️⃣ Sign up the user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
      });
      if (signUpError) throw signUpError;

      const userId = data?.user?.id;
      if (!userId) {
        toast.error('User creation failed: no user ID returned');
        return;
      }

      // 2️⃣ Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (!existingProfile) {
        // 3️⃣ Create profile record
        const { error: profileError } = await supabase.from('profiles').insert({
          user_id: userId,
          full_name: newUser.full_name,
          role: newUser.role || 'job_seeker',
        });

        if (profileError) throw profileError;
      }

      toast.success('User registered successfully!');
      setAddingUser(false);
      fetchUsers();
    } catch (err: any) {
      console.error('Add user failed:', err);
      toast.error(err.message || 'Failed to add user');
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-black">
        <div className="h-12 w-12 border-b-2 border-[#10b981] rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            User Management
          </h1>
          <p className="text-sm text-gray-500">
            Showing {filteredUsers.length} user(s)
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setAddingUser(true)}
            className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-[#10b981] to-[#047857] flex items-center gap-2 hover:shadow-lg transition"
          >
            Add User
          </button>
        </div>
      </div>

      {/* Filters */}
      <UserFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {/* Table */}
      <UserTable
        users={filteredUsers}
        hasMore={false}
        fetchMore={() => {}}
        selectedUsers={selectedUsers}
        setSelectedUsers={setSelectedUsers}
        handleEdit={setEditingUser}
        handleAction={handleBulkAction}
        currentUserId={currentUserId}
      />

      {/* Modals */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onUserUpdated={fetchUsers}
        />
      )}

      {addingUser && (
        <AddUserModal onClose={() => setAddingUser(false)} onSave={handleAddUser} />
      )}

      {filteredUsers.length === 0 && (
        <p className="text-center text-gray-500 py-8">
          No users found matching your criteria.
        </p>
      )}
    </div>
  );
};

export default AdminUsers;
