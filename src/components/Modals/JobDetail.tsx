import { X, ExternalLink, MapPin, Briefcase, Share2, EyeOff, Check, Copy, Bookmark } from 'lucide-react';
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
      await supabase.from('job_views').upsert({
        user_id: user.id,
        job_id: job.id,
        viewed_at: new Date().toISOString(),
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
      maxWidth="max-w-4xl"
      className="relative bg-white dark:bg-dark-25 overflow-hidden"
      isOpen={isOpen}
      onClose={onClose}
      isCloseIcon={false}
    >
      {/* Header with gradient background */}
      <div className="relative bg-gradient-to-r from-[#10b981] to-[#047857] text-white px-8 py-6">
        <div className="flex justify-between items-start">
          <div className="flex-1 pr-4">
            <h1 className="text-3xl font-bold mb-2 leading-tight">
              {job?.title}
            </h1>
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => job?.company?.website && window.open(job.company.website, '_blank')}
                className="text-xl font-semibold hover:underline cursor-pointer flex items-center gap-2"
              >
                {job?.company?.name}
                <ExternalLink size={16} />
              </button>
            </div>
            {/* Meta Tags Row */}
            <div className="flex flex-wrap gap-3">
              {job?.location && (
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <MapPin size={16} />
                  <span className="text-sm font-medium">{job.location}</span>
                </div>
              )}

              {job?.employment_type && (
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Briefcase size={16} />
                  <span className="text-sm font-medium">{job.employment_type}</span>
                </div>
              )}

              {job?.salary_range && (
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <span className="text-sm font-medium">{job.salary_range}</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex-shrink-0 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>
      {/* Action Section */}
      <div className='bg-white dark:bg-dark-25 px-8 py-6 border-b border-gray-200 dark:border-dark-15'>
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-3">
            <Button
              onClick={handleApplyNow}
              className=" w-40 !bg-[#10b981] !border-[#10b981] !py-1 !px-6 text-sm !text-white hover:!bg-[#047857] font-semibold rounded-lg shadow-sm hover:shadow-md transition-all justify-center"
            >
              Apply Now
            </Button>

            <Button
              onClick={handleSave}
              className={`!py-1 !px-6 text-sm font-semibold rounded-lg shadow-sm hover:shadow-md transition-all w-40 justify-center ${isSaved
                ? '!bg-[#10b981] !border-[#10b981] !text-white hover:!bg-[#047857]'
                : '!border-[#10b981] !bg-white !text-[#10b981] hover:!bg-[#10b981] hover:!text-white dark:!bg-dark-25 dark:!text-[#10b981] dark:hover:!bg-[#10b981] dark:hover:!text-white'
              }`}
            >
              <Bookmark size={16} className="mr-2" />
              {isSaved ? 'Saved' : 'Save Job'}
            </Button>

            <Button
              onClick={handleMarkApplied}
              className={`!py-1 !px-6 text-sm font-semibold rounded-lg shadow-sm hover:shadow-md transition-all w-40 justify-center ${isApplied
                ? '!bg-[#10b981] !border-[#10b981] !text-white hover:!bg-[#047857]'
                : '!border-[#10b981] !bg-white !text-[#10b981] hover:!bg-[#10b981] hover:!text-white dark:!bg-dark-25 dark:!text-[#10b981] dark:hover:!bg-[#10b981] dark:hover:!text-white'
              }`}
            >
              <Check size={16} className="mr-2" />
              {isApplied ? 'Applied' : 'Mark Applied'}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-3 text-gray-500 hover:text-[#10b981] dark:text-gray-400 dark:hover:text-[#10b981] rounded-lg hover:bg-gray-100 dark:hover:bg-dark-20 transition-colors"
              title="Share job"
            >
              <Share2 size={20} />
            </button>

            <button
              onClick={handleHide}
              className="p-3 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-20 transition-colors"
              title={isHidden ? "Unhide job" : "Hide job"}
            >
              <EyeOff size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="max-h-[calc(100dvh-500px)] overflow-y-auto">
        {/* Job Meta */}
        <div className="px-8 py-4 bg-gray-50 dark:bg-dark-20 border-b border-gray-200 dark:border-dark-15">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Posted {Math.floor((new Date().getTime() - new Date(job?.created_at || new Date()).getTime()) / (1000 * 60 * 60 * 24))} days ago
          </p>
        </div>

        {/* Company Card */}
        {job?.company && (
          <div className="px-8 py-6">
            <div className="bg-gradient-to-r from-[#10b981]/10 to-[#047857]/10 dark:from-[#10b981]/5 dark:to-[#047857]/5 rounded-xl p-6 border border-[#10b981]/20 dark:border-[#10b981]/10">
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
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Job Description
              </h3>

              <button
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#10b981] hover:text-[#047857] dark:text-[#10b981] dark:hover:text-[#10b981] rounded-lg hover:bg-[#10b981]/10 dark:hover:bg-[#10b981]/10 transition-colors"
                onClick={() => copyToClipboard(job.description)}
              >
                {isCopied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                {isCopied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-dark-20 dark:to-dark-25 rounded-xl p-6 border border-gray-200 dark:border-dark-15 shadow-sm">
              <div className="prose prose-lg max-w-none dark:prose-invert prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-headings:text-gray-900 dark:prose-headings:text-white">
                <div className="whitespace-pre-wrap">
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
