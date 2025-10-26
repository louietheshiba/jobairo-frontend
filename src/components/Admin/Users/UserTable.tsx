'use client';
import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { User } from '../../../utils/userTypes';
import { getRoleColor } from '../../../utils/userHelpers';
import { Eye, Edit, EyeOff, Trash2, Mail, Calendar, CheckSquare, Square } from 'lucide-react';

interface UserTableProps {
  users: User[];
  hasMore: boolean;
  fetchMore: () => void;
  selectedUsers: string[];
  setSelectedUsers: React.Dispatch<React.SetStateAction<string[]>>;
  handleEdit: (user: User) => void;
  handleAction: (id: string, action: string) => void;
  currentUserId: string | null;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  hasMore,
  fetchMore,
  selectedUsers,
  setSelectedUsers,
  handleEdit,
  handleAction,
  currentUserId
}) => {
  const handleSelectUser = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedUsers(
      selectedUsers.length === users.length ? [] : users.map((u) => u.id)
    );
  };

  return (
    <div className="bg-white dark:bg-dark-25 border border-gray-200 dark:border-dark-20 rounded-xl shadow-sm overflow-hidden">
      <InfiniteScroll
        dataLength={users.length}
        next={fetchMore}
        hasMore={hasMore}
        loader={
          <div className="flex justify-center py-4">
            <div className="animate-spin h-6 w-6 border-b-2 border-[#10b981] rounded-full" />
          </div>
        }
        endMessage={
          <p className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
            All users loaded
          </p>
        }
      >
        <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-20">
          <thead className="bg-gray-50 dark:bg-dark-20">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-white uppercase">
                <button onClick={handleSelectAll}>
                  {selectedUsers.length === users.length && users.length > 0 ? (
                    <CheckSquare className="h-4 w-4 text-[#10b981]" />
                  ) : (
                    <Square className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-white uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-white uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-white uppercase">Joined</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-white uppercase">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-dark-20">
            {users.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-gray-50 dark:hover:bg-dark-20 transition"
              >
                <td className="px-6 py-4">
                  {user.id !== currentUserId && (
                    <button onClick={() => handleSelectUser(user.id)}>
                      {selectedUsers.includes(user.id) ? (
                        <CheckSquare className="h-4 w-4 text-[#10b981]" />
                      ) : (
                        <Square className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  )}
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {user.full_name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {user.full_name || 'No name'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        <Mail className="h-3 w-3 mr-1" /> {user.email}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${getRoleColor(
                      user.role
                    )}`}
                  >
                    {user.role}
                  </span>
                </td>

                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  {new Date(user.created_at).toLocaleDateString()}
                </td>

                <td className="px-6 py-4 text-right">
                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-[#10b981] hover:text-[#047857]"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </InfiniteScroll>
    </div>
  );
};

export default UserTable;
