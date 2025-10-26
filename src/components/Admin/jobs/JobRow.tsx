import React from 'react';
import { Eye, EyeOff, Trash2, Edit, CheckSquare, Square } from 'lucide-react';
import { supabase } from '@/utils/supabase';
import toast from 'react-hot-toast';

const JobRow = ({ job, selectedJobs, setSelectedJobs, onEdit, onStatusChange, getStatusColor }: any) => {
  const handleSelect = () => {
    setSelectedJobs((prev: string[]) =>
      prev.includes(job.id)
        ? prev.filter((id) => id !== job.id)
        : [...prev, job.id]
    );
  };

  const handleAction = async (action: 'hide' | 'show' | 'delete') => {
    const statusMap = { hide: 'hidden', show: 'open', delete: 'closed' };
    const { error } = await supabase
      .from('jobs')
      .update({ status: statusMap[action] })
      .eq('id', job.id);
    if (!error) {
      toast.success(`Job ${action}d successfully`);
      onStatusChange();
    }
  };

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-dark-20 transition">
      <td className="px-6 py-4">
        <button onClick={handleSelect}>
          {selectedJobs.includes(job.id)
            ? <CheckSquare className="h-4 w-4 text-[#10b981]" />
            : <Square className="h-4 w-4 text-gray-400" />}
        </button>
      </td>
      <td className="px-6 py-4">{job.title}</td>
      <td className="px-6 py-4">{job.company?.name || 'N/A'}</td>
      <td className="px-6 py-4">{job.location}</td>
      <td className="px-6 py-4">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(job.status)}`}>
          {job.status}
        </span>
      </td>
      <td className="px-6 py-4 flex gap-3 justify-end">
        <button onClick={() => onEdit(job)} className="text-[#10b981] hover:text-[#047857]">
          <Edit className="h-4 w-4" />
        </button>
        {job.status === 'open' ? (
          <button onClick={() => handleAction('hide')} className="text-yellow-600">
            <EyeOff className="h-4 w-4" />
          </button>
        ) : (
          <button onClick={() => handleAction('show')} className="text-green-600">
            <Eye className="h-4 w-4" />
          </button>
        )}
        <button onClick={() => handleAction('delete')} className="text-red-600">
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
};

export default JobRow;
