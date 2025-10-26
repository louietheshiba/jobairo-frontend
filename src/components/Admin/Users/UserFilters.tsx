import React from 'react';
import { Search } from 'lucide-react';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface UserFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  roleFilter: string;
  setRoleFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
}

const UserFilters: React.FC<UserFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  roleFilter,
  setRoleFilter,

}) => (
  <div className="bg-white dark:bg-dark-25 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      <div className="flex-1 w-full relative">
        <Search className="absolute left-3 top-3 w-5 text-gray-400 dark:text-gray-500" />
        <Input
          type="text"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border-gray-300 dark:border-gray-600 rounded-lg 
                     focus:ring-2 focus:ring-[#10b981] focus:border-[#10b981] 
                     dark:bg-dark-50 dark:text-white"
        />
      </div>

      <div className="w-40">
        <Select
          value={{
            value: roleFilter,
            label: roleFilter === 'all' ? 'All Roles' : roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1),
          }}
          onChange={(option: any) => setRoleFilter(option?.value || 'all')}
          options={[
            { value: 'all', label: 'All Roles' },
            { value: 'admin', label: 'Admin' },
            { value: 'job_seeker', label: 'Job Seeker' },
          ]}
        />
      </div>
    </div>
  </div>
);

export default UserFilters;
