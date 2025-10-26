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

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({
  isOpen,
  job,
  onClose,
}) => {
  const { user } = useAuth();
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  // ✅ Always define hooks at top level (no conditionals)
  const [isSaved, setIsSaved] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const hasChecked = useRef(false);

  /** ✅ Fetch job status only once per job/user */
  useEffect(() => {
    if (!user || !job || hasChecked.current) return;
    hasChecked.current = true;

    const fetchJobStatus = async () => {
      try {
        const [saved, applied, hidden] = await Promise.allSettled([
          supabase
            .from("saved_jobs")
            .select("id")
            .eq("user_id", user.id)
            .eq("job_id", job.id)
            .single(),
          supabase
            .from("applied_jobs")
            .select("id")
            .eq("user_id", user.id)
            .eq("job_id", job.id)
            .single(),
          supabase
            .from("hidden_jobs")
            .select("id")
            .eq("user_id", user.id)
            .eq("job_id", job.id)
            .single(),
        ]);

        if (saved.status === "fulfilled" && saved.value.data) setIsSaved(true);
        if (applied.status === "fulfilled" && applied.value.data)
          setIsApplied(true);
        if (hidden.status === "fulfilled" && hidden.value.data)
          setIsHidden(true);

        // Record job view
        await supabase.from("job_views").upsert({
          user_id: user.id,
          job_id: job.id,
          viewed_at: new Date().toISOString(),
        });

        activityTracker.trackActivity(job.id, "view", {
          title: job.title,
          location: job.location,
          company: job.company?.name,
          category: job.job_category,
          employmentType: job.employment_type,
        });

        window.dispatchEvent(new CustomEvent("statsRefresh"));
        window.dispatchEvent(new CustomEvent("jobViewed"));
      } catch (error) {
        console.error("Status check failed:", error);
      }
    };

    fetchJobStatus();
  }, [user, job]);

  /** ✅ Generalized Toggle Function (Save / Apply / Hide) */
  const toggleJobStatus = useCallback(
    async (
      table: string,
      current: boolean,
      setFn: React.Dispatch<React.SetStateAction<boolean>>,
      action: "save" | "apply" | "hide"
    ) => {
      if (!user) {
        toast.error("Please login first");
        return;
      }

      const optimisticState = !current;
      setFn(optimisticState);

      try {
        if (optimisticState) {
          await supabase.from(table).insert({ user_id: user.id, job_id: job.id });
          toast.success(
            action === "save"
              ? "Job saved 🎉"
              : action === "apply"
              ? "Marked as applied 🎉"
              : "Job hidden successfully"
          );

          activityTracker.trackActivity(job.id, action, {
            title: job.title,
            location: job.location,
            company: job.company?.name,
            category: job.job_category,
            employmentType: job.employment_type,
          });

          window.dispatchEvent(new CustomEvent("statsRefresh"));
          window.dispatchEvent(
            new CustomEvent(`job${action[0].toUpperCase() + action.slice(1)}`, {
              detail: { jobId: job.id },
            })
          );

          if (action === "hide") onClose();
        } else {
          await supabase
            .from(table)
            .delete()
            .eq("user_id", user.id)
            .eq("job_id", job.id);
          toast(
            action === "save"
              ? "Job unsaved"
              : action === "apply"
              ? "Application unmarked"
              : "Job unhidden"
          );
          window.dispatchEvent(new CustomEvent("statsRefresh"));
        }
      } catch (err) {
        console.error(`Error updating ${action} status:`, err);
        setFn(!optimisticState);
        toast.error("Action failed, please try again");
      }
    },
    [user, job, onClose]
  );

  /** ✅ Share Handler */
  const handleShare = useCallback(() => {
    if (!job) return;
    const url = `${window.location.origin}/jobs/${job.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Job link copied 📋");
  }, [job]);

  /** ✅ Apply Handler */
  const handleApplyNow = useCallback(() => {
    if (!job?.application_url) {
      toast.error("Application URL not available");
      return;
    }
    window.open(job.application_url, "_blank");
  }, [job]);

  /** ✅ Safe render check (no hooks below this) */
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
      <div className="relative bg-[#10b981] text-white px-8 py-6">
        <div className="flex justify-between items-start">
          <div className="flex-1 pr-4">
            <h1 className="text-[20px] font-bold mb-2 leading-tight">{job.title}</h1>

            {job.company?.name && (
              <button
                onClick={() =>
                  job.company?.website && window.open(job.company.website, "_blank")
                }
                className="text-xl font-semibold hover:underline flex items-center gap-2 hover:scale-105 transition-all"
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
              {job.salary_range && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[10px] text-sm font-medium bg-gradient-to-r from-[#10b981] to-[#047857] text-white shadow">
                  {job.salary_range}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex-shrink-0 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 hover:scale-105 transition-all"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* ===== Action Buttons ===== */}
      <div className="bg-white dark:bg-dark-25 px-8 py-6 border-b border-gray-200 dark:border-dark-15 flex flex-wrap gap-3 items-center">
        <button
          onClick={handleApplyNow}
          className="bg-[#10b981] text-white py-1 px-6 text-sm font-semibold rounded-lg shadow hover:shadow-lg hover:-translate-y-0.5 transition-all"
        >
          Apply Now
        </button>

        <button
          onClick={() => toggleJobStatus("saved_jobs", isSaved, setIsSaved, "save")}
          className={`flex items-center py-1 px-6 text-sm font-semibold rounded-lg transition-all duration-300 ${
            isSaved
              ? "bg-[#10b981] text-white"
              : "border border-[#10b981] text-[#10b981] hover:bg-[#10b981] hover:text-white"
          }`}
        >
          <Bookmark size={16} className="mr-2" />
          {isSaved ? "Saved" : "Save Job"}
        </button>

        <button
          onClick={() =>
            toggleJobStatus("applied_jobs", isApplied, setIsApplied, "apply")
          }
          className={`flex items-center py-1 px-6 text-sm font-semibold rounded-lg transition-all duration-300 ${
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
          className="p-3 text-gray-500 hover:text-[#10b981] dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-20 transition-all"
          title="Share job"
        >
          <Share2 size={20} />
        </button>

        <button
          onClick={() =>
            toggleJobStatus("hidden_jobs", isHidden, setIsHidden, "hide")
          }
          className="p-3 text-gray-500 hover:text-red-500 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-20 transition-all"
          title={isHidden ? "Unhide job" : "Hide job"}
        >
          <EyeOff size={20} />
        </button>
      </div>

      {/* ===== Job Description ===== */}
      <div className="max-h-[calc(100dvh-300px)] overflow-y-auto px-8 py-6">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Posted{" "}
          {Math.floor(
            (Date.now() - new Date(job.created_at).getTime()) /
              (1000 * 60 * 60 * 24)
          )}{" "}
          days ago
        </p>

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
