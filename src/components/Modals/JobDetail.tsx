import {
  X,
  ExternalLink,
  MapPin,
  Briefcase,
  Share2,
  EyeOff,
  Check,
  Copy,
  Bookmark,
} from "lucide-react";
import React, { useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import useCopyToClipboard from "@/hooks/copyToClipboard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/utils/supabase";
import { activityTracker } from "@/utils/activityTracker";
import type { JobDetailsModalProps } from "@/types/JobTypes";
import Modal from "../ui/modal";

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ isOpen, job, onClose }) => {
  const { user } = useAuth();
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  const [isSaved, setIsSaved] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const hasChecked = useRef(false);

  // ✅ Reset when a new job opens
  useEffect(() => {
    if (!job) return;
    hasChecked.current = false;
    setIsSaved(false);
    setIsApplied(false);
    setIsHidden(false);
  }, [job]);

  // ✅ Fetch job status when modal opens
  useEffect(() => {
    if (!user || !job || hasChecked.current) return;
    hasChecked.current = true;

    const fetchJobStatus = async () => {
      try {
        const [saved, applied, hidden] = await Promise.allSettled([
          supabase.from("saved_jobs").select("id").eq("user_id", user.id).eq("job_id", job.id).single(),
          supabase.from("applied_jobs").select("id").eq("user_id", user.id).eq("job_id", job.id).single(),
          supabase.from("hidden_jobs").select("id").eq("user_id", user.id).eq("job_id", job.id).single(),
        ]);

        if (saved.status === "fulfilled" && saved.value.data) setIsSaved(true);
        if (applied.status === "fulfilled" && applied.value.data) setIsApplied(true);
        if (hidden.status === "fulfilled" && hidden.value.data) setIsHidden(true);

        // Record view
        await supabase.from("job_views").upsert({
          user_id: user.id,
          job_id: job.id,
          viewed_at: new Date().toISOString(),
        });

        activityTracker.trackActivity(job.id, "view", {
          title: job.title,
          company: job.company?.name,
        });
        window.dispatchEvent(new CustomEvent("statsRefresh"));
      } catch (err) {
        console.error("Error fetching job status:", err);
      }
    };

    fetchJobStatus();
  }, [user, job]);

  // ✅ Handle Save / Apply / Hide
  const toggleJobStatus = useCallback(
    async (table: string, current: boolean, setFn: any, action: "save" | "apply" | "hide") => {
      if (!user) return toast.error("Please login first");

      const newState = !current;
      setFn(newState);

      try {
        if (newState) {
          await supabase.from(table).insert({ user_id: user.id, job_id: job.id });
          toast.success(
            action === "save"
              ? "Job saved 🎉"
              : action === "apply"
              ? "Marked as applied 🎉"
              : "Job hidden"
          );
          activityTracker.trackActivity(job.id, action, { title: job.title });
          window.dispatchEvent(new CustomEvent("refreshJobs"));
          if (action === "hide") onClose();
        } else {
          await supabase.from(table).delete().eq("user_id", user.id).eq("job_id", job.id);
          toast(
            action === "save"
              ? "Job unsaved"
              : action === "apply"
              ? "Application unmarked"
              : "Job unhidden"
          );
          window.dispatchEvent(new CustomEvent("refreshJobs"));
        }
      } catch (err) {
        console.error(`Error updating ${action}:`, err);
        setFn(!newState);
        toast.error("Action failed, please try again");
      }
    },
    [user, job, onClose]
  );

  // ✅ Apply + Share handlers
  const handleApplyNow = () => {
    if (!job?.application_url) return toast.error("Application link not available");
    window.open(job.application_url, "_blank");
  };

  const handleShare = () => {
    const url = `${window.location.origin}/jobs/${job.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Job link copied 📋");
  };

  if (!isOpen || !job) return null;

  return (
    <Modal
      maxWidth="max-w-4xl"
      className="relative bg-white dark:bg-dark-25 overflow-hidden"
      isOpen={isOpen}
      onClose={onClose}
      isCloseIcon={false}
    >
      {/* ===== Header Section ===== */}
      <div className="bg-[#10b981] text-white px-8 py-6 flex justify-between items-start">
        <div className="flex-1 pr-4">
          <h1 className="text-[20px] font-bold mb-2 leading-tight">{job.title}</h1>

          {job.company?.name && (
            <button
              onClick={() => job.company?.website && window.open(job.company.website, "_blank")}
              className="text-lg font-semibold flex items-center gap-2 hover:underline hover:scale-105 transition-all"
            >
              {job.company.name}
              <ExternalLink size={16} />
            </button>
          )}

          <div className="flex gap-3 flex-wrap mt-3">
            {job.location && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[10px] text-sm font-medium bg-white text-black shadow">
                <MapPin size={16} /> {job.location}
              </span>
            )}
            {job.employment_type && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[10px] text-sm font-medium bg-white text-black shadow">
                <Briefcase size={16} /> {job.employment_type}
              </span>
            )}
            {job.salary && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[10px] text-sm font-medium bg-gradient-to-r from-[#10b981] to-[#047857] text-white shadow">
                ${job.salary.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="flex-shrink-0 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
        >
          <X size={20} />
        </button>
      </div>

      {/* ===== Action Buttons ===== */}
      <div className="bg-white dark:bg-dark-25 px-8 py-5 border-b border-gray-200 dark:border-dark-15 flex flex-wrap gap-3 items-center">
        <button
          onClick={handleApplyNow}
          className="bg-[#10b981] text-white py-1.5 px-6 text-sm font-semibold rounded-lg shadow hover:-translate-y-0.5 transition-all"
        >
          Apply Now
        </button>

        <button
          onClick={() => toggleJobStatus("saved_jobs", isSaved, setIsSaved, "save")}
          className={`flex items-center py-1.5 px-6 text-sm font-semibold rounded-lg transition-all ${
            isSaved
              ? "bg-[#10b981] text-white"
              : "border border-[#10b981] text-[#10b981] hover:bg-[#10b981] hover:text-white"
          }`}
        >
          <Bookmark size={16} className="mr-2" />
          {isSaved ? "Saved" : "Save Job"}
        </button>

        <button
          onClick={() => toggleJobStatus("applied_jobs", isApplied, setIsApplied, "apply")}
          className={`flex items-center py-1.5 px-6 text-sm font-semibold rounded-lg transition-all ${
            isApplied
              ? "bg-[#10b981] text-white"
              : "border border-[#10b981] text-[#10b981] hover:bg-[#10b981] hover:text-white"
          }`}
        >
          <Check size={16} className="mr-2" />
          {isApplied ? "Applied" : "Mark Applied"}
        </button>

        <button
          onClick={handleShare}
          className="p-3 text-gray-500 hover:text-[#10b981] dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-20"
          title="Share job"
        >
          <Share2 size={20} />
        </button>

        <button
          onClick={() => toggleJobStatus("hidden_jobs", isHidden, setIsHidden, "hide")}
          className="p-3 text-gray-500 hover:text-red-500 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-20"
          title={isHidden ? "Unhide job" : "Hide job"}
        >
          <EyeOff size={20} />
        </button>
      </div>

      {/* ===== Job Description ===== */}
      <div className="max-h-[calc(100vh-300px)] overflow-y-auto px-8 py-6">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Posted{" "}
          {Math.floor(
            (Date.now() - new Date(job.created_at).getTime()) / (1000 * 60 * 60 * 24)
          )}{" "}
          days ago
        </p>

        {/* Company Info */}
        {job.company && (
          <div className="bg-[#10b981]/10 rounded-xl p-6 mb-6 border border-[#10b981]/20">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center border">
                {job.company.logo_url ? (
                  <img
                    src={job.company.logo_url}
                    alt={job.company.name}
                    className="w-10 h-10 rounded-lg"
                  />
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
                  {job.company.name} is a leading company in the{" "}
                  {job.company.industry || "technology"} industry.
                </p>
                {job.company.website && (
                  <a
                    href={job.company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-3 text-[#10b981] hover:text-[#047857] font-medium"
                  >
                    Visit website <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        {job.description && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[20px] font-bold text-[#333] dark:text-white">
                Job Description
              </h3>

              <button
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#10b981] hover:scale-105 transition-all"
                onClick={() => copyToClipboard(job.description)}
              >
                {isCopied ? <Check size={16} /> : <Copy size={16} />}
                {isCopied ? "Copied!" : "Copy"}
              </button>
            </div>

            <div className="bg-gray-50 dark:bg-dark-20 rounded-xl p-6 border dark:border-dark-15">
              <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-200 leading-relaxed">
                {job.description}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default JobDetailsModal;
