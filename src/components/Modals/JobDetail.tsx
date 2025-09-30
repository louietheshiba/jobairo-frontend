import { X, ExternalLink, MapPin, Briefcase, Share2, EyeOff, Flag, Check, Copy } from 'lucide-react';
import React from 'react';
import useCopyToClipboard from '@/hooks/copyToClipboard';
import type { JobDetailsModalProps } from '@/types/JobTypes';
import { applyToJob, saveJob, hideJob, reportJob } from '@/utils/jobs';
import { Button } from '../ui/button';
import Modal from '../ui/modal';

const JobDetailsModal = ({ isOpen, job, onClose }: JobDetailsModalProps) => {
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  if (!isOpen) return null;

  const handleApplyNow = () => {
    if (job) {
      applyToJob(job.id.toString());
      window.open(`https://example.com/apply/${job.id}`, '_blank');
      alert('Application opened in new tab!');
    }
    onClose();
  };

  const handleSave = () => {
    if (job) {
      saveJob(job.id.toString());
      alert('Job saved to your favorites!');
    }
    onClose();
  };

  const handleMarkApplied = () => {
    if (job) {
      applyToJob(job.id.toString());
      alert('Job marked as applied!');
    }
    onClose();
  };

  const handleShare = () => {
    const url = `${window.location.origin}/jobs/${job?.id}`;
    navigator.clipboard.writeText(url);
    alert('Job link copied to clipboard!');
  };

  const handleHide = () => {
    if (job) {
      hideJob(job.id.toString());
      alert('Job hidden from your feed!');
    }
    onClose();
  };

  const handleReport = () => {
    if (job) {
      reportJob(job.id.toString());
      alert('Job reported. Thank you for your feedback!');
    }
    onClose();
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
          <span className="text-lg text-[#10b981] dark:text-gray-300">
            {job?.company?.name}
          </span>
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
            className=" !border-[#10b981] !bg-white !py-2 text-sm !text-[#10b981] w-40 hover:!bg-[#10b981] hover:!text-white dark:!bg-dark-25 dark:!text-[#10b981] dark:hover:!bg-[#10b981] dark:hover:!text-white"
          >
            Save
          </Button>

          <Button
            onClick={handleMarkApplied}
            className=" !border-[#10b981] !bg-white !py-2 text-sm !text-[#10b981] w-40 hover:!bg-[#10b981] hover:!text-white dark:!bg-dark-25 dark:!text-[#10b981] dark:hover:!bg-[#10b981] dark:hover:!text-white"
          >
            Mark Applied
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

          <button
            onClick={handleReport}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <Flag size={18} />
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
