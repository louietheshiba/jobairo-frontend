import { X, ExternalLink, MapPin, Briefcase, Share2, EyeOff, Check, Copy, Bookmark } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import useCopyToClipboard from '@/hooks/copyToClipboard';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/utils/supabase';
import { activityTracker } from '@/utils/activityTracker';
import type { JobDetailsModalProps } from '@/types/JobTypes';
import Modal from '../ui/modal';

const JobDetailsModal = ({ isOpen, job, onClose }: JobDetailsModalProps) => {
  const { user } = useAuth();
  const { copyToClipboard, isCopied } = useCopyToClipboard();
  const [isSaved, setIsSaved] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const hasChecked = useRef(false);

  useEffect(() => {
    hasChecked.current = false;
  }, [job]);

  useEffect(() => {
    if (!user || !job || hasChecked.current) return;

    hasChecked.current = true;

    const checkStatus = async () => {
      // Check if saved
      const { data: savedData } = await supabase
        .from('saved_jobs')
        .select('id')
        .eq('user_id', user.id)
        .eq('job_id', job.id)
        .single();
      setIsSaved(!!savedData);

      // Check if applied (assuming applied_jobs table)
      const { data: appliedData } = await supabase
        .from('applied_jobs')
        .select('id')
        .eq('user_id', user.id)
        .eq('job_id', job.id)
        .single();
      setIsApplied(!!appliedData);

      // Check if hidden
      const { data: hiddenData } = await supabase
        .from('hidden_jobs')
        .select('id')
        .eq('user_id', user.id)
        .eq('job_id', job.id)
        .single();
      setIsHidden(!!hiddenData);

      // Add to viewed jobs
      await supabase.from('job_views').upsert({
        user_id: user.id,
        job_id: job.id,
        viewed_at: new Date().toISOString(),
      });

      // Track job view in activity tracker
      activityTracker.trackActivity(job.id, 'view', {
        title: job.title,
        location: job.location,
        company: job.company?.name,
        category: job.job_category,
        employmentType: job.employment_type
      });

      // Trigger stats refresh and job viewed event
      window.dispatchEvent(new CustomEvent('statsRefresh'));
      window.dispatchEvent(new CustomEvent('jobViewed'));
    };

    checkStatus();
  }, [user, job]);

  if (!isOpen) return null;

  const handleApplyNow = () => {
    if (job) {
      if (job.application_url) {
        window.open(job.application_url, '_blank');
      } else {
        toast.error('Application URL not available');
      }
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.error('You need to login first');
      return;
    }

    if (!job) return;

    try {
      if (isSaved) {
        // Unsave
        const { error } = await supabase
          .from('saved_jobs')
          .delete()
          .eq('user_id', user.id)
          .eq('job_id', job.id);

        if (error) throw error;

        setIsSaved(false);
        toast.success('Job unsaved successfully');
        // Trigger stats refresh and job unsaved event
        window.dispatchEvent(new CustomEvent('statsRefresh'));
        window.dispatchEvent(new CustomEvent('jobUnsaved'));
      } else {
        // Save
        const { error } = await supabase.from('saved_jobs').insert({
          user_id: user.id,
          job_id: job.id,
        });

        if (error) throw error;

        setIsSaved(true);
        toast.success('Job saved successfully! 🎉');
        // Track save activity
        activityTracker.trackActivity(job.id, 'save', {
          title: job.title,
          location: job.location,
          company: job.company?.name,
          category: job.job_category,
          employmentType: job.employment_type
        });
        // Trigger stats refresh and job saved event
        window.dispatchEvent(new CustomEvent('statsRefresh'));
        window.dispatchEvent(new CustomEvent('jobSaved', { detail: { jobId: job.id } }));
      }
    } catch (error) {
      console.error('Error saving/unsaving job:', error);
      toast.error('Failed to save/unsave job');
    }
  };

  const handleMarkApplied = async () => {
    if (!user) {
      toast.error('You need to login first');
      return;
    }

    if (!job) return;

    try {
      if (isApplied) {
        // Unmark
        const { error } = await supabase
          .from('applied_jobs')
          .delete()
          .eq('user_id', user.id)
          .eq('job_id', job.id);

        if (error) throw error;

        setIsApplied(false);
        toast.success('Application unmarked');
        // Trigger stats refresh
        window.dispatchEvent(new CustomEvent('statsRefresh'));
      } else {
        // Mark applied
        const { error } = await supabase.from('applied_jobs').insert({
          user_id: user.id,
          job_id: job.id,
        });

        if (error) throw error;

        setIsApplied(true);
        toast.success('Job marked as applied! 🎉');
        // Trigger stats refresh and job applied event
        window.dispatchEvent(new CustomEvent('statsRefresh'));
        window.dispatchEvent(new CustomEvent('jobApplied', { detail: { jobId: job.id } }));
      }
    } catch (error) {
      console.error('Error marking/unmarking applied:', error);
      toast.error('Failed to update application status');
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/jobs/${job?.id}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Job link copied to clipboard!');
    });
  };

  const handleHide = async () => {
    if (!user) {
      toast.error('You need to login first');
      return;
    }

    if (!job) return;

    try {
      if (isHidden) {
        // Unhide
        const { error } = await supabase
          .from('hidden_jobs')
          .delete()
          .eq('user_id', user.id)
          .eq('job_id', job.id);

        if (error) throw error;

        setIsHidden(false);
        toast.success('Job unhidden');
        // Trigger stats refresh
        window.dispatchEvent(new CustomEvent('statsRefresh'));
      } else {
        // Hide
        const { error } = await supabase.from('hidden_jobs').insert({
          user_id: user.id,
          job_id: job.id,
        });

        if (error) throw error;

        setIsHidden(true);
        toast.success('Job hidden from your feed');
        // Track hide activity
        activityTracker.trackActivity(job.id, 'hide', {
          title: job.title,
          location: job.location,
          company: job.company?.name,
          category: job.job_category,
          employmentType: job.employment_type
        });
        // Trigger stats refresh and job hidden event
        window.dispatchEvent(new CustomEvent('statsRefresh'));
        window.dispatchEvent(new CustomEvent('jobHidden', { detail: { jobId: job.id } }));
        onClose();
      }
    } catch (error) {
      console.error('Error hiding/unhiding job:', error);
      toast.error('Failed to hide/unhide job');
    }
  };

  return (
    <Modal
      maxWidth="max-w-4xl"
      className="relative bg-white dark:bg-dark-25 overflow-hidden"
      isOpen={isOpen}
      onClose={onClose}
      isCloseIcon={false}
    >
      {/* Header with gradient background */}
      <div className="relative bg-[#10b981] text-white px-8 py-6">
        <div className="flex justify-between items-start">
          <div className="flex-1 pr-4">
            <h1 className="text-[20px] font-bold mb-2 leading-tight">
              {job?.title}
            </h1>
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => job?.company?.website && window.open(job.company.website, '_blank')}
                className="text-xl font-semibold hover:underline cursor-pointer flex items-center gap-2 hover:scale-105 transition-all duration-300"
              >
                {job?.company?.name}
                <ExternalLink size={16} />
              </button>
            </div>
            {/* Meta Tags Row */}
            <div className="flex gap-3">
              {job?.location && (
                <span className='inline-flex items-center gap-2 px-3 py-1.5 rounded-[10px] text-sm font-medium  bg-white text-black shadow-[0_2px_8px_rgba(0,212,170,0.2)]' >
                  <MapPin size={16} aria-hidden="true" />
                  <span>{job.location}</span>
                </span>
              )}

              {job?.employment_type && (
                <span className={`inline-flex items-center gap-2 whitespace-nowrap px-3 py-1.5 rounded-[10px] text-sm font-medium  bg-white text-black shadow-[0_2px_8px_rgba(0,212,170,0.2)]`}>
                  <Briefcase size={16} aria-hidden="true" />
                  <span>{job.employment_type}</span>
                </span>
              )}

              {job?.salary_range && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[10px] text-sm font-medium bg-gradient-to-r from-[#10b981] to-[#047857] text-white shadow-[0_2px_8px_rgba(16,185,129,0.2)]">
                  <span>{job.salary_range}</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex-shrink-0 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 hover:scale-105 transition-all duration-300"
          >
            <X size={20} />
          </button>
        </div>
      </div>
      {/* Action Section */}
      <div className='bg-white dark:bg-dark-25 px-8 py-6 border-b border-gray-200 dark:border-dark-15'>
        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={handleApplyNow}
            className="bg-[#10b981] text-white py-1 px-6 text-sm font-semibold rounded-lg shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 transition-all duration-300 justify-center"
          >
            Apply Now
          </button>

          <button
            onClick={handleSave}
            className={`flex py-1 px-6 text-sm font-semibold rounded-lg shadow-[0_4px_15px_rgba(0,212,170,0.3)] hover:shadow-[0_6px_20px_rgba(0,212,170,0.4)] hover:-translate-y-0.5 transition-all duration-300 justify-center ${isSaved
              ? 'bg-[#10b981] text-white'
              : 'border-[#10b981] bg-white text-[#10b981] hover:bg-gradient-to-r hover:from-[#10b981] hover:to-[#047857] hover:text-white dark:bg-dark-25 dark:text-[#10b981] dark:hover:bg-gradient-to-r dark:hover:from-[#10b981] dark:hover:to-[#047857] dark:hover:text-white'
              }`}
          >
            <Bookmark size={16} className="mr-2" />
            {isSaved ? 'Saved' : 'Save Job'}
          </button>

          <button
            onClick={handleMarkApplied}
            className={`flex py-1 px-6 text-sm font-semibold rounded-lg shadow-[0_4px_15px_rgba(0,212,170,0.3)] hover:shadow-[0_6px_20px_rgba(0,212,170,0.4)] hover:-translate-y-0.5 transition-all duration-300 justify-center ${isApplied
              ? 'bg-[#10b981] text-white'
              : 'border-[#10b981] bg-white text-[#10b981] hover:bg-gradient-to-r hover:from-[#10b981] hover:to-[#047857] hover:text-white dark:bg-dark-25 dark:text-[#10b981] dark:hover:bg-gradient-to-r dark:hover:from-[#10b981] dark:hover:to-[#047857] dark:hover:text-white'
              }`}
          >
            <Check size={16} className="mr-2" />
            {isApplied ? 'Applied' : 'Mark Applied'}
          </button>

          <button
            onClick={handleShare}
            className="p-3 text-gray-500 hover:text-[#10b981] dark:text-gray-400 dark:hover:text-[#10b981] rounded-lg hover:bg-gray-100 dark:hover:bg-dark-20 hover:scale-105 transition-all duration-300"
            title="Share job"
          >
            <Share2 size={20} />
          </button>

          <button
            onClick={handleHide}
            className="p-3 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-20 hover:scale-105 transition-all duration-300"
            title={isHidden ? "Unhide job" : "Hide job"}
          >
            <EyeOff size={20} />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="max-h-[calc(100dvh-300px)] overflow-y-auto">
        {/* Job Meta */}
        <div className="px-8 py-4 bg-gray-50 dark:bg-dark-20 border-b border-gray-200 dark:border-dark-15">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Posted {Math.floor((new Date().getTime() - new Date(job?.created_at || new Date()).getTime()) / (1000 * 60 * 60 * 24))} days ago
          </p>
        </div>

        {/* Company Card */}
        {job?.company && (
          <div className="px-8 py-6">
            <div className="bg-[#10b981]/10 dark:from-[#10b981]/5 dark:to-[#047857]/5 rounded-xl p-6 border border-[#10b981]/20 dark:border-[#10b981]/10">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-white dark:bg-dark-15 rounded-xl flex items-center justify-center shadow-sm border border-gray-200 dark:border-dark-15">
                  {job.company.logo_url ? (
                    <img src={job.company.logo_url} alt={job.company.name} className="w-10 h-10 rounded-lg" />
                  ) : (
                    <span className="text-2xl font-bold text-[#10b981]">
                      {job.company.name.charAt(0)}
                    </span>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    About {job.company.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {job.company.name} is a leading company in the {job.company.industry || 'technology'} industry with {job.company.size || 'multiple'} employees.
                  </p>
                  {job.company.website && (
                    <a
                      href={job.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-3 text-[#10b981] hover:text-[#047857] font-medium transition-colors"
                    >
                      Visit website <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Job Description */}
        {job?.description && (
          <div className="px-8 pb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[20px] font-bold text-[#333] dark:text-white">
                Job Description
              </h3>

              <button
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#10b981] hover:text-[#10b981] dark:text-[#10b981]  hover:bg-opacity-10 dark:hover:bg-gradient-to-r dark:hover:from-[#10b981] dark:hover:to-[#047857] dark:hover:bg-opacity-10 hover:scale-105 transition-all duration-300"
                onClick={() => copyToClipboard(job.description)}
              >
                {isCopied ? <Check size={16} className="text-[#10b981]" /> : <Copy size={16} />}
                {isCopied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-dark-20 dark:to-dark-25 rounded-xl p-6 border border-gray-200 dark:border-dark-15 shadow-sm">
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-200 leading-relaxed">
                  {job.description}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default JobDetailsModal;
