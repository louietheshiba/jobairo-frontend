import { X, ExternalLink, MapPin, Briefcase, Share2, EyeOff, Flag, Check, Copy, Bookmark } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import useCopyToClipboard from '@/hooks/copyToClipboard';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/utils/supabase';
import type { JobDetailsModalProps } from '@/types/JobTypes';
import { Button } from '../ui/button';
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
      await supabase.from('viewed_jobs').upsert({
        user_id: user.id,
        job_id: job.id,
      });
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
      } else {
        // Save
        const { error } = await supabase.from('saved_jobs').insert({
          user_id: user.id,
          job_id: job.id,
        });

        if (error) throw error;

        setIsSaved(true);
        toast.success('Job saved successfully! 🎉');
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
      } else {
        // Mark applied
        const { error } = await supabase.from('applied_jobs').insert({
          user_id: user.id,
          job_id: job.id,
        });

        if (error) throw error;

        setIsApplied(true);
        toast.success('Job marked as applied! 🎉');
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
      } else {
        // Hide
        const { error } = await supabase.from('hidden_jobs').insert({
          user_id: user.id,
          job_id: job.id,
        });

        if (error) throw error;

        setIsHidden(true);
        toast.success('Job hidden from your feed');
        onClose();
      }
    } catch (error) {
      console.error('Error hiding/unhiding job:', error);
      toast.error('Failed to hide/unhide job');
    }
  };

  return (
    <Modal
      maxWidth="max-w-2xl"
      className="relative bg-white py-1 dark:bg-dark-25"
      isOpen={isOpen}
      onClose={onClose}
      isCloseIcon={false}
    >


      {/* Fixed Content */}
      <div className="px-8 pt-4">
        <div className='flex justify-between'>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {job?.title}
          </h1>
          <button
            onClick={onClose}
            className="text-xl text-gray-500 hover:text-gray-700 dark:text-white"
          >
            <X />
          </button>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => job?.company?.website && window.open(job.company.website, '_blank')}
            className="text-lg text-[#10b981] dark:text-gray-300 hover:underline cursor-pointer"
          >
            {job?.company?.name}
          </button>
          <ExternalLink size={16} className="text-[#10b981]" />
        </div>
        {/* Meta Tags Row */}
        <div className="flex flex-wrap gap-3 mb-4">
          {job?.location && (
            <div className="flex items-center gap-1 bg-[#10b981]/20 dark:bg-[#10b981] px-3 py-1 rounded-full">
              <MapPin size={14} className="text-[#047857] " />
              <span className="text-sm text-[#047857] ">{job.location}</span>
            </div>
          )}

          {job?.employment_type && (
            <div className="flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-full">
              <Briefcase size={14} className="text-gray-600 " />
              <span className="text-sm text-gray-600">{job.employment_type}</span>
            </div>
          )}
        </div>
      </div>
      {/* Action Row */}
      <div className='bg-gray-50 p-6 border border-gray-200 dark:bg-dark-20 dark:border-dark-15 rounded-lg mb-4'>

        <div className="flex gap-3 mb-4">
          <Button
            onClick={handleApplyNow}
            className=" !bg-[#10b981] !border-[#10b981] !py-2  text-sm !text-white hover:!bg-[#047857] w-40"
          >
            Apply Now
          </Button>

          <Button
            onClick={handleSave}
            className={`!py-2 text-sm w-40 ${isSaved
              ? '!bg-[#10b981] !border-[#10b981] !text-white hover:!bg-[#047857]'
              : '!border-[#10b981] !bg-white !text-[#10b981] hover:!bg-[#10b981] hover:!text-white dark:!bg-dark-25 dark:!text-[#10b981] dark:hover:!bg-[#10b981] dark:hover:!text-white'
            }`}
          >
            {isSaved ? 'Saved' : 'Save'}
          </Button>

          <Button
            onClick={handleMarkApplied}
            className={`!py-2 text-sm w-40 ${isApplied
              ? '!bg-[#10b981] !border-[#10b981] !text-white hover:!bg-[#047857]'
              : '!border-[#10b981] !bg-white !text-[#10b981] hover:!bg-[#10b981] hover:!text-white dark:!bg-dark-25 dark:!text-[#10b981] dark:hover:!bg-[#10b981] dark:hover:!text-white'
            }`}
          >
            {isApplied ? 'Applied' : 'Mark Applied'}
          </Button>


        </div>
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={handleShare}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <Share2 size={18} />
          </button>

          <button
            onClick={handleHide}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <EyeOff size={18} />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="max-h-[calc(100dvh-400px)] overflow-y-auto">
        {/* Job Meta */}
        <p className="px-8 mb-2 text-sm text-gray-500 dark:text-gray-400 ">
          Posted 2 days ago • Be one of the first 25 applicants
        </p>
        {/* Company Card */}
        {job?.company && (
          <div className="px-8 mb-6">
            <div className="bg-[#10b981]/20 dark:bg-dark-20 rounded-lg p-5 border border-gray-200 dark:border-dark-15">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-white dark:bg-dark-15 rounded-lg flex items-center justify-center">
                  {job.company.logo_url ? (
                    <img src={job.company.logo_url} alt={job.company.name} className="w-8 h-8" />
                  ) : (
                    <span className="text-lg font-bold text-gray-600 dark:text-gray-300">
                      {job.company.name.charAt(0)}
                    </span>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    About {job.company.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {job.company.name} is a leading company in the {job.company.industry || 'technology'} industry with {job.company.size || 'multiple'} employees.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Job Description */}
        {job?.description && (
          <div className="px-8 pb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Job Description
              </h3>

              <button
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-dark-20 transition-colors"
                onClick={() => copyToClipboard(job.description)}
              >
                {isCopied ? <Check size={14} color="green" /> : <Copy size={14} />}
                Copy
              </button>
            </div>

            <div className="bg-gray-50 dark:bg-dark-20 rounded-lg p-5 border border-gray-200 dark:border-dark-15">
              <div className="prose prose-sm max-w-none dark:prose-invert prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed">
                <p className="mb-0">
                  {job.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default JobDetailsModal;
