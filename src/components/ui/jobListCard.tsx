import { Bookmark } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/utils/supabase';
import { getDisplayLabelFromLocation } from '@/utils/locations';
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

  const handleQuickApply = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // Simply open the application URL without saving to database
    if (item.application_url) {
      window.open(item.application_url, '_blank');
    } else {
      toast.error('Application URL not available');
    }
  };

  return (
    <div
      onClick={() => onClick(item)}
      className="group relative flex min-h-[220px] flex-col gap-3 rounded-[16px] bg-white p-6 border-2 border-transparent shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,212,170,0.15)] hover:border-[#10b981] hover:-translate-y-1 cursor-pointer dark:bg-dark-25"
    >
      {/* Header with Title and Bookmark */}
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-poppins text-[20px] font-bold text-[#333] dark:text-white flex-1 pr-2">
          {item?.title}
        </h2>
        <button
          className="flex-shrink-0 rounded-full p-2 hover:bg-gray-100 dark:hover:bg-dark-30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          onClick={handleSaveJob}
          disabled={isSaving}
        >
          <Bookmark className={`w-5 h-5 transition-all duration-300 ${isSaved ? 'fill-[#10b981] stroke-[#10b981]' : 'stroke-[#999] fill-none hover:stroke-[#10b981] hover:scale-110'}`} />
        </button>
      </div>

      {/* Salary Range */}
      <div className="flex justify-end">
        <span className={`font-poppins text-xs font-semibold text-secondary dark:text-white ${item?.salary_range ? 'border border-[#10b981] rounded px-1.5 py-0.5' : ''}`}>
          {item?.salary_range || ''}
        </span>
      </div>

      {/* Company Info */}
      <div className="flex flex-col gap-1 text-[14px] text-[#666] dark:text-gray-400">
          <span className="capitalize">{getDisplayLabelFromLocation(item?.location) || 'Not specified'}</span>

        <div className="flex items-center gap-2">
          <span className="capitalize">{item?.company?.name || 'Not specified'}</span>
          <span className="text-gray-400">•</span>
          <span>Posted {Math.floor((new Date().getTime() - new Date(item?.created_at || new Date()).getTime()) / (1000 * 60 * 60 * 24))} days ago</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
        {item?.description || 'No description available'}
      </p>

      {/* Job Tags */}
      <div className="flex flex-wrap gap-2 group-hover:mb-[50px] transition-all duration-300">
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
      <div className="absolute bottom-6 left-6 right-6">
        <button
          className="w-full rounded-md bg-[#10b981] py-2 font-poppins text-sm font-medium text-white duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(16,185,129,0.4)] opacity-0 translate-y-[10px] group-hover:opacity-100 group-hover:translate-y-0 transition-all"
          onClick={handleQuickApply}
        >
          Quick Apply
        </button>
      </div>
    </div>
  );
};

export default JobListCard;
