import React, { useState, useEffect, useCallback } from 'react';
import { Bookmark, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/hooks/useAuth';
import jobActivity from '@/utils/jobActivity';
import { activityTracker } from '@/utils/activityTracker';
import { getDisplayLabelFromLocation } from '@/utils/locations';
import type { JobListCardProps } from '@/types/JobTypes';

const JobListCard: React.FC<JobListCardProps> = React.memo(({ 
  item, 
  onClick, 
  isSaved: initialIsSaved = false, 
  onSave 
}) => {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isSaving, setIsSaving] = useState(false);

  // Sync initial saved state from parent
  useEffect(() => {
    setIsSaved(initialIsSaved);
  }, [initialIsSaved]);

  // ✅ Optimized Save/Unsave handler
  const handleSaveJob = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user) {
      toast.error('You need to login first');
      return;
    }
    if (isSaving) return;

    setIsSaving(true);

    const optimisticSaved = !isSaved;
    setIsSaved(optimisticSaved);
    onSave?.(item.id, optimisticSaved);

    try {
      if (optimisticSaved) {
        // --- SAVE JOB ---
        toast.success('Job saved! 🎉');

        await Promise.allSettled([
          supabase.from('saved_jobs').insert({ user_id: user.id, job_id: item.id }),
          jobActivity.recordSave(item),
          Promise.resolve(activityTracker.trackActivity(item.id, 'save', item)),
        ]);

        // trigger light-weight refresh events
        window.dispatchEvent(new CustomEvent('statsRefresh'));
        window.dispatchEvent(new CustomEvent('jobSaved', { detail: { jobId: item.id } }));
      } else {
        // --- UNSAVE JOB ---
        toast('Job unsaved');
        await Promise.allSettled([
          supabase.from('saved_jobs')
            .delete()
            .eq('user_id', user.id)
            .eq('job_id', item.id),
        ]);
        window.dispatchEvent(new CustomEvent('statsRefresh'));
      }
    } catch (error) {
      console.error('Error in handleSaveJob:', error);
      setIsSaved(!optimisticSaved);
      onSave?.(item.id, !optimisticSaved);
      toast.error('Something went wrong while saving');
    } finally {
      setIsSaving(false);
    }
  }, [user, item, isSaved, isSaving, onSave]);

  // ✅ Quick Apply
  const handleQuickApply = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!item.application_url) {
      toast.error('Application URL not available');
      return;
    }

    try {
      await Promise.allSettled([
        jobActivity.recordApply(item),
        Promise.resolve(activityTracker.trackActivity(item.id, 'apply', item)),
      ]);

      window.dispatchEvent(new CustomEvent('statsRefresh'));
      window.dispatchEvent(new CustomEvent('jobApplied', { detail: { jobId: item.id } }));

      window.open(item.application_url, '_blank');
    } catch (err) {
      console.error('Error in handleQuickApply:', err);
      toast.error('Unable to open application link');
    }
  }, [item]);

  // ✅ Card Click Handler
  const handleCardClick = useCallback(() => {
    try {
      jobActivity.recordView(item).then(() => {
        window.dispatchEvent(new CustomEvent('relevantJobsRefresh'));
      });
    } catch (err) {
      console.error('Error recording job view:', err);
    }

    activityTracker.trackActivity(item.id, 'view', item);
    onClick(item);
  }, [item, onClick]);

  // --- UI ---
  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col gap-3 rounded-[16px] bg-white p-6 border-2  
        shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-300 
        hover:shadow-[0_8px_24px_rgba(0,212,170,0.15)] hover:border-[#10b981] dark:hover:border-[#10b981] 
        hover:-translate-y-1 cursor-pointer dark:bg-[#282828] dark:border-white"
      style={{ minHeight: 260 }}
    >
      {/* --- Header --- */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 pr-2">
          <h2 className="font-poppins text-[20px] font-bold text-[#111] dark:text-white leading-tight line-clamp-2">
            {item?.title}
          </h2>
        </div>

        {/* --- Bookmark Button --- */}
        <div className="flex-shrink-0">
          <button
            onClick={handleSaveJob}
            disabled={isSaving}
            className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-dark-30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            <Bookmark
              className={`w-5 h-5 transition-all duration-300 ${
                isSaved
                  ? 'fill-[#10b981] stroke-[#10b981]'
                  : 'stroke-[#999] fill-none hover:stroke-[#10b981] hover:scale-110'
              }`}
            />
          </button>
        </div>
      </div>

      {/* --- Company and Salary --- */}
      <div className="mt-1 flex items-center justify-between">
        <span className="text-lg font-semibold text-[#0f172a] dark:text-white">
          {item?.companies?.name || 'Not specified'}
        </span>

        {item?.salary_range && (
          <span className="inline-flex items-center gap-2 rounded-md bg-[#ecfdf5] border border-[#bbf7d0] px-3 py-1 text-sm font-semibold text-[#065f46]">
            {item.salary_range}
          </span>
        )}
      </div>

      {/* --- Location and Meta --- */}
      <div className="mt-3 flex items-center justify-between text-sm text-[#444] dark:text-gray-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-[#065f46]">
            <MapPin className="w-4 h-4 text-[#065f46]" />
            <span className="font-medium truncate max-w-[200px]">
              {getDisplayLabelFromLocation(item?.location) || 'Not specified'}
            </span>
          </div>
          <div className="text-gray-400">•</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Posted {Math.floor((Date.now() - new Date(item?.created_at || Date.now()).getTime()) / (1000 * 60 * 60 * 24))} days ago
          </div>
        </div>
      </div>

      {/* --- Description & Tags --- */}
      <div className="flex-1 flex flex-col justify-between pb-12">
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 overflow-hidden">
          {item?.description || 'No description available'}
        </p>

        <div className="flex items-center gap-2 min-h-[32px] flex-wrap transition-all duration-300 mt-3">
          {item?.employment_type && (
            <span className="tag capitalize">{item.employment_type}</span>
          )}
          {item?.remote_type && (
            <span className="tag capitalize">{item.remote_type}</span>
          )}
          {item?.department && (
            <span className="tag capitalize">{item.department}</span>
          )}
        </div>
      </div>

      {/* --- Quick Apply Button --- */}
      <div className="absolute bottom-6 left-6 right-6">
        <button
          onClick={handleQuickApply}
          className="w-full rounded-md bg-[#10b981] py-2 font-poppins text-sm font-medium text-white 
            duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(16,185,129,0.4)] 
            opacity-0 translate-y-[10px] group-hover:opacity-100 group-hover:translate-y-0 transition-all"
        >
          Quick Apply
        </button>
      </div>
    </div>
  );
});

JobListCard.displayName = 'JobListCard';
export default JobListCard;
