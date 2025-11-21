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

  // Get company initials for logo placeholder
  const getCompanyInitials = (name?: string) => {
    if (!name) return 'CO';
    const words = name.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Generate color based on company name
  const getCompanyColor = (name?: string) => {
    if (!name) return 'bg-gray-200 dark:bg-gray-700';
    
    // Specific colors for well-known companies
    const companyColors: { [key: string]: string } = {
      'Microsoft': 'bg-green-100 dark:bg-green-900/30',
      'Apple': 'bg-blue-500',
      'Google': 'bg-blue-500',
      'Meta': 'bg-blue-600',
      'Amazon': 'bg-orange-500',
      'Netflix': 'bg-red-600',
      'Tesla': 'bg-red-600',
    };
    
    if (companyColors[name]) {
      return companyColors[name];
    }
    
    // Fallback to random color based on name
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Get text color for logo
  const getTextColor = (name?: string) => {
    if (!name) return 'text-gray-600';
    if (name === 'Microsoft') return 'text-green-600 dark:text-green-400';
    return 'text-white';
  };

  // --- UI ---
  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col gap-5 rounded-2xl bg-white p-8 border-2 border-gray-200
        shadow-sm transition-all duration-300 
        hover:shadow-lg hover:border-t-8 hover:border-t-[#10b981] hover:border-[#10b981] dark:hover:border-[#10b981]
        cursor-pointer dark:bg-dark-20 dark:border-gray-700"
      style={{ minHeight: 320 }}
    >
      {/* --- Header with Logo --- */}
      <div className="flex items-start gap-4">
        {/* Company Logo */}
        <div
          className={`flex-shrink-0 w-16 h-16 rounded-2xl ${getCompanyColor(
            item?.companies?.name
          )} flex items-center justify-center`}
        >
          <span
            className={`${getTextColor(
              item?.companies?.name
            )} font-bold text-xl`}
          >
            {getCompanyInitials(item?.companies?.name)}
          </span>
        </div>

        {/* Title and Company */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-base text-gray-500 dark:text-gray-400 mb-2">
                {item?.companies?.name || "Company"}
              </p>
              <h2 className="font-bold text-2xl text-gray-900 dark:text-white leading-tight line-clamp-2">
                {item?.title}
              </h2>
            </div>

            {/* --- Bookmark Button --- */}
            <button
              onClick={handleSaveJob}
              disabled={isSaving}
              className="flex-shrink-0 rounded-full p-2 hover:bg-gray-100 dark:hover:bg-dark-30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              <Bookmark
                className={`w-5 h-5 transition-all duration-300 ${
                  isSaved
                    ? "fill-[#10b981] stroke-[#10b981]"
                    : "stroke-gray-400 fill-none hover:stroke-[#10b981] hover:scale-110"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* --- Location and Job Type --- */}
      <div className="flex items-center gap-2 flex-wrap text-base">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <span className="text-red-500">📍</span>
          <span className="font-medium">
            {getDisplayLabelFromLocation(item?.location) || "Remote"}
          </span>
        </div>
        {item?.employment_type && (
          <>
            <div className="flex items-center gap-2">
              <span>🏢</span>
              <span className="text-gray-600 dark:text-gray-400 font-medium capitalize">
                {item.employment_type.replace("-", " ")}
              </span>
            </div>
          </>
        )}
        {item?.remote_type && (
          <>
            <div className="flex items-center gap-2">
              <span>🏡</span>
              <span className="text-gray-600 dark:text-gray-400 font-medium capitalize">
                {item.remote_type}
              </span>
            </div>
          </>
        )}
      </div>

      {/* --- Skills/Tags --- */}
      <div className="flex items-center gap-3 flex-wrap">
        {item?.department && (
          <span className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            {item.department}
          </span>
        )}
        {/* Mock skill tags based on title */}
        {item?.title?.toLowerCase().includes("senior") && (
          <span className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            Figma
          </span>
        )}
        {item?.title?.toLowerCase().includes("design") && (
          <span className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            Design Systems
          </span>
        )}
      </div>

      {/* --- Salary Range --- */}
      {item?.salary_range && (
        <div className="mt-auto pt-4">
          <p className="text-2xl font-bold text-[#10b981]">
            {item.salary_range}
          </p>
        </div>
      )}

      {/* --- Quick Apply Button --- */}
      <div className="absolute bottom-8  right-8 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
        <button
          onClick={handleQuickApply}
          className="w-fit rounded-2xl bg-[#10b981] py-4 px-6 font-semibold text-white text-lg
            shadow-md hover:bg-[#059669] transition-all duration-200 flex items-center justify-center gap-3"
        >
          Quick Apply
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </button>
      </div>
    </div>
  );
});

JobListCard.displayName = 'JobListCard';
export default JobListCard;
