import { Bookmark, MapPin } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import jobActivity from '@/utils/jobActivity';
import { activityTracker } from '@/utils/activityTracker';
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
  try { await jobActivity.recordSave(item); } catch (e) {}
  activityTracker.trackActivity(item.id, 'save', item);
        toast.success('Job saved successfully! 🎉');
        // Trigger stats refresh and job saved event
        window.dispatchEvent(new CustomEvent('statsRefresh'));
        window.dispatchEvent(new CustomEvent('jobSaved', { detail: { jobId: item.id } }));
  // Notify relevant jobs to refresh since user activity changed
  window.dispatchEvent(new CustomEvent('relevantJobsRefresh'));
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
      // record apply event and then open
      try { await jobActivity.recordApply(item); } catch (e) {}
      activityTracker.trackActivity(item.id, 'apply', item);
      window.dispatchEvent(new CustomEvent('statsRefresh'));
      window.dispatchEvent(new CustomEvent('jobApplied', { detail: { jobId: item.id } }));
      window.dispatchEvent(new CustomEvent('relevantJobsRefresh'));
      window.open(item.application_url, '_blank');
    } else {
      toast.error('Application URL not available');
    }
  };

  const handleCardClick = () => {
    try { jobActivity.recordView(item).then(() => {
      window.dispatchEvent(new CustomEvent('relevantJobsRefresh'));
    }); } catch (e) {}
    activityTracker.trackActivity(item.id, 'view', item);
    onClick(item);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col gap-3 rounded-[16px] bg-white p-6 border-2 border-transparent shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,212,170,0.15)] hover:border-[#10b981] hover:-translate-y-1 cursor-pointer dark:bg-dark-25"
      style={{ minHeight: 260 }}
    >
      {/* Header: Title and Bookmark */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 pr-2">
          <h2 className="font-poppins text-[20px] font-bold text-[#111] dark:text-white leading-tight line-clamp-2">
            {item?.title}
          </h2>
        </div>

        {/* Bookmark at the top-right */}
        <div className="flex-shrink-0">
          <button
            className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-dark-30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            onClick={handleSaveJob}
            disabled={isSaving}
          >
            <Bookmark className={`w-5 h-5 transition-all duration-300 ${isSaved ? 'fill-[#10b981] stroke-[#10b981]' : 'stroke-[#999] fill-none hover:stroke-[#10b981] hover:scale-110'}`} />
          </button>
        </div>
      </div>

      {/* Company and Salary row (salary under the bookmark on the right) */}
      <div className="mt-1 flex items-center justify-between">
        <div>
          <span className="text-lg font-semibold text-[#0f172a] dark:text-white">{item?.company?.name || 'Not specified'}</span>
        </div>

        <div className="flex-shrink-0">
          {item?.salary_range ? (
            <span className="inline-flex items-center gap-2 rounded-md bg-[#ecfdf5] border border-[#bbf7d0] px-3 py-1 text-sm font-semibold text-[#065f46]">
              <span className="font-poppins">{item?.salary_range}</span>
            </span>
          ) : (
            <span className="text-sm text-gray-500"></span>
          )}
        </div>
      </div>

      {/* Location and meta row */}
      <div className="mt-3 flex items-center justify-between text-sm text-[#444] dark:text-gray-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-[#065f46]">
            <MapPin className="w-4 h-4 text-[#065f46]" />
            <span className="font-medium truncate max-w-[200px]">{getDisplayLabelFromLocation(item?.location) || 'Not specified'}</span>
          </div>

          <div className="text-gray-400">•</div>

          <div className="text-sm text-gray-600 dark:text-gray-400">Posted {Math.floor((new Date().getTime() - new Date(item?.created_at || new Date()).getTime()) / (1000 * 60 * 60 * 24))} days ago</div>
        </div>
      </div>
      {/* Body: description (flex-1) and tag row reserve */}
      <div className="flex-1 flex flex-col justify-between pb-12">
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 overflow-hidden">
          {item?.description || 'No description available'}
        </p>

        {/* Job Tags - reserve space so cards align */}
        <div className="flex items-center gap-2 min-h-[32px] flex-wrap transition-all duration-300 mt-3">
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
