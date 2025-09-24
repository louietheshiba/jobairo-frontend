import type { FiltersType, Option } from './FiltersType';

export type Job = {
  id: number;
  title: string;
  salary: string;
  source: string[];
  job_type: string;
  company_name: string;
  description: string;
  requirements: string[];
  benefits: string[];
};

export type JobDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
};

export type JobListCardProps = {
  item: Job;
  onClick: (job: Job) => void;
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
