import { Check, Copy, X } from 'lucide-react';
import React from 'react';

import useCopyToClipboard from '@/hooks/copyToClipboard';
import type { JobDetailsModalProps } from '@/types/JobTypes';
import { applyToJob, saveJob } from '@/utils/jobs';

import { Button } from '../ui/button';
import Modal from '../ui/modal';

const JobDetailsModal = ({ isOpen, job, onClose }: JobDetailsModalProps) => {
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  if (!isOpen) return null;

  const handleApplyNow = () => {
    if (job) {
      applyToJob(job.id);
      alert('You have applied for the job!');
    }
    onClose();
  };

  const handleSave = () => {
    if (job) {
      saveJob(job.id);
      alert('Job saved to your favorites!');
    }
    onClose();
  };

  return (
    <Modal
      maxWidth="max-w-4xl"
      className="relative bg-white py-4 dark:bg-dark-25"
      isOpen={isOpen}
      onClose={onClose}
      isCloseIcon={false}
    >
      <div className="flex w-full items-center justify-between border-b px-8 pb-4 dark:border-dark-20">
        <h2 className="text-xl font-semibold text-secondary dark:text-white">
          {job?.title}
        </h2>

        <button
          onClick={onClose}
          className="text-xl text-gray-500 hover:text-gray-700 dark:text-white"
        >
          <X />
        </button>
      </div>

      <div className="max-h-[calc(100dvh-200px)] overflow-y-auto pb-4">
        <div className="px-8">
          <div className="mt-4 grid grid-cols-2 justify-between gap-4 rounded-lg bg-themeGray-5 px-4 py-3 dark:bg-dark-20 sm:flex">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500 dark:text-white">
                Company
              </h3>
              <p className="text-sm font-medium text-black dark:text-white">
                {job?.source[0]}
              </p>
            </div>

            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500 dark:text-white">
                Location
              </h3>
              <p className="text-sm font-medium text-black dark:text-white">
                {job?.source[1]}
              </p>
            </div>

            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500 dark:text-white">
                Salary
              </h3>
              <p className="text-sm font-medium text-black dark:text-white">
                {job?.salary}
              </p>
            </div>

            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500 dark:text-white">
                Job Type
              </h3>
              <p className="text-sm font-medium text-black dark:text-white">
                {job?.job_type}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 px-8">
          <h3 className="mb-2 text-lg font-semibold text-secondary dark:text-white">
            Company Details
          </h3>

          <div className="rounded-lg bg-themeGray-5 px-4 py-3 dark:bg-dark-20">
            <p className="text-sm text-secondary dark:text-white">
              {job?.company_name}
            </p>

            <div className="mt-4 flex justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-500 dark:text-white">
                  Industry
                </h3>
                <p className="text-sm font-medium text-secondary dark:text-white">
                  {job?.source[0]}
                </p>
              </div>

              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-500 dark:text-white">
                  Employees
                </h3>
                <p className="text-sm font-medium text-secondary dark:text-white">
                  {job?.source[1]}
                </p>
              </div>
            </div>

            <div className="mt-4 flex justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-500 dark:text-white">
                  Founded
                </h3>
                <p className="text-sm font-medium text-secondary dark:text-white">
                  {job?.salary}
                </p>
              </div>

              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-500 dark:text-white">
                  Headquarters
                </h3>
                <p className="text-sm font-medium text-secondary dark:text-white">
                  Full Time
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 px-8">
          <div className="align-center flex justify-between">
            <h3 className="text-lg font-semibold text-secondary dark:text-white">
              Job Details
            </h3>

            <button
              className="flex items-center rounded-md bg-themeGray-5 px-3 py-1 text-secondary dark:bg-dark-20 dark:text-white"
              onClick={() =>
                copyToClipboard(job?.description || '')
              }
            >
              {isCopied ? (
                <Check size={14} color="green" />
              ) : (
                <Copy size={14} />
              )}
              <p className="ml-2 text-sm font-medium">Copy Description</p>
            </button>
          </div>

          <div className="flex flex-col gap-3 rounded-lg bg-themeGray-5 px-4 py-3 dark:bg-dark-20">
            <div className="flex flex-col gap-0.5">
              <h6 className="text-sm font-medium text-gray-500 dark:text-white">
                Description
              </h6>

              <p className="text-sm font-medium text-secondary dark:text-white">
                {job?.description}
              </p>
            </div>

            <div className="flex flex-col gap-0.5">
              <h6 className="text-sm font-medium text-gray-500 dark:text-white">
                Requirements
              </h6>

              <ul className="flex flex-col gap-0.5 text-sm font-medium text-secondary dark:text-white">
                {job?.requirements?.map((requirement) => (
                  <li key={requirement}>● {requirement}</li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-0.5">
              <h6 className="text-sm font-medium text-gray-500 dark:text-white">
                Benefits
              </h6>

              <ul className="flex flex-col gap-0.5 text-sm font-medium text-secondary dark:text-white">
                {job?.benefits?.map((benifit) => (
                  <li key={benifit}>● {benifit}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-8 border-t px-8 py-2 pt-6 dark:border-dark-20">
        <div className="flex w-fit items-center gap-4">
          <Button
            onClick={handleApplyNow}
            className="whitespace-nowrap !border-primary-10 !bg-primary-10 !py-2 px-5 text-sm !text-white duration-300 hover:!border-primary-15 hover:!bg-primary-15"
          >
            Apply Now
          </Button>

          <Button
            onClick={handleSave}
            className="whitespace-nowrap !border-primary-10 !bg-white !py-2 px-5 text-sm !text-primary-10 hover:!bg-green-50 dark:!bg-dark-25 dark:hover:!bg-dark-20"
          >
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default JobDetailsModal;
