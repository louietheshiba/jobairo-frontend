import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

interface JobFiltersProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
}

const JobFilters: React.FC<JobFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
}) => (
  <div className="bg-white dark:bg-dark-25 border border-gray-200 dark:border-dark-20 rounded-xl p-6 shadow-sm">
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 w-5 text-gray-400" />
        <Input
          placeholder="Search by title or company..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="sm:w-48">
        <Select
          value={{
            value: statusFilter,
            label:
              statusFilter === 'all'
                ? 'All Status'
                : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1),
          }}
          onChange={(opt: any) => setStatusFilter(opt?.value || 'all')}
          options={[
            { value: 'all', label: 'All Status' },
            { value: 'open', label: 'Open' },
            { value: 'hidden', label: 'Hidden' },
            { value: 'closed', label: 'Closed' },
          ]}
        />
      </div>
    </div>
  </div>
);

export default JobFilters;
