import type { FiltersType, Option } from './FiltersType';

export type Job = {
  id: string; // UUID from database
  company_id: string;
  title: string;
  description: string;
  location: string;
  department?: string;
  employment_type: string; // full-time, part-time, contract
  remote_type: string; // remote, hybrid, onsite
  salary_range: string;
  application_url?: string;
  source_url?: string;
  ats_type?: string;
  external_job_id?: string;
  date_posted?: string;
  scraped_at?: string;
  status: string;
  created_at: string;
  updated_at: string;
  experience_level?: string;
  job_category?: string;
  required_skills?: string;
  benefits?: string;
  visa_sponsorship?: string;
  equity_offered?: string;
  salary?: string;
  // Joined company data
  company?: {
    id: string;
    name: string;
    logo_url?: string;
    website?: string;
    size?: string;
    industry?: string;
  };
};

export type JobDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
};

export type JobListCardProps = {
  item: Job;
  onClick: (job: Job) => void;
  isSaved?: boolean;
  onSave?: (jobId: string, isSaved: boolean) => void;
  onApply?: (jobId: string) => void;
};

export type JobListProps = {
  filters: FiltersType;
  handleChange: (
    key: string,
    selected: Option[] | Option | string | string[] | number[] | null
  ) => void;
};

export type LiveJobsProps = {
  setFilters: React.Dispatch<React.SetStateAction<FiltersType>>;
  filters: FiltersType;
  handleChange: (
    key: string,
    selected: Option[] | Option | string | string[] | number[] | null
  ) => void;
};
