import { Bookmark } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/utils/supabase';
import type { JobListCardProps } from '@/types/JobTypes';

const JobListCard = ({ item, onClick, isSaved: initialIsSaved = false, onSave }: JobListCardProps) => {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsSaved(initialIsSaved);
  }, [initialIsSaved]);

  const handleSaveJob = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user) {
      toast.error('You need to login first');
      return;
    }

    if (isSaving) return;

    setIsSaving(true);

    try {
      if (isSaved) {
        // Unsave
        const { error } = await supabase
          .from('saved_jobs')
          .delete()
          .eq('user_id', user.id)
          .eq('job_id', item.id);

        if (error) throw error;

        setIsSaved(false);
        onSave?.(item.id, false);
        toast.success('Job unsaved successfully!');
        // Trigger stats refresh
        window.dispatchEvent(new CustomEvent('statsRefresh'));
      } else {
        // Save
        const { error } = await supabase.from('saved_jobs').insert({
          user_id: user.id,
          job_id: item.id,
        });

        if (error) throw error;

        setIsSaved(true);
        onSave?.(item.id, true);
        toast.success('Job saved successfully! 🎉');
        // Trigger stats refresh
        window.dispatchEvent(new CustomEvent('statsRefresh'));
      }
    } catch (error) {
      console.error('Error saving/unsaving job:', error);
      toast.error('Failed to save/unsave job');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      onClick={() => onClick(item)}
      className="group relative flex min-h-[220px] flex-col gap-3 rounded-lg bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg cursor-pointer dark:bg-dark-25"
    >
      {/* Header with Title and Bookmark */}
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-poppins text-lg font-semibold text-secondary dark:text-white flex-1 pr-2">
          {item?.title}
        </h2>
        <button
          className="flex-shrink-0 rounded-full p-2 hover:bg-gray-100 dark:hover:bg-dark-30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          onClick={handleSaveJob}
          disabled={isSaving}
        >
          <Bookmark className={`w-5 h-5 ${isSaved ? 'text-primary-10 fill-primary-10' : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'}`} />
        </button>
      </div>

      {/* Salary Range */}
      <div className="flex justify-end">
        <span className="font-poppins text-sm font-semibold text-secondary dark:text-white sm:text-base">
          {item?.salary_range || ''}
        </span>
      </div>

      {/* Company Info */}
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <span className="font-medium">{item?.company?.name || 'Company not specified'}</span>
        <span className="text-gray-400">•</span>
        <span className="capitalize">{item?.remote_type || 'Not specified'}</span>
        <span className="text-gray-400">•</span>
        <span>Posted {Math.floor((new Date().getTime() - new Date(item?.created_at || new Date()).getTime()) / (1000 * 60 * 60 * 24))} days ago</span>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
        {item?.description || 'No description available'}
      </p>

      {/* Job Tags */}
      <div className="flex flex-wrap gap-2">
        <span className={`tag capitalize ${item?.employment_type?.toLowerCase()}`}>
          {item?.employment_type}
        </span>
        <span className={`tag capitalize ${item?.remote_type?.toLowerCase()}`}>
          {item?.remote_type}
        </span>
        {item?.department && (
          <span className="tag">
            {item.department}
          </span>
        )}
      </div>

      {/* Quick Apply Button - Hidden by default, shows on card hover */}
      <div className="mt-auto pt-4">
        <button
          className="w-full rounded-md border border-primary-10 bg-primary-10 py-2 font-poppins text-sm font-medium text-white duration-300 hover:border-primary-15 hover:bg-primary-15 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onClick(item); // Open modal
          }}
        >
          Quick Apply
        </button>
      </div>
    </div>
  );
};

export default JobListCard;
