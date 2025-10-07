export interface Option {
  id: number;
  value: string;
  label: string;
}

export interface FiltersType {
  locations: Option[];
  workSchedule: Option[];
  position: string;
  jobType: string;
  company: string;
  datePosted: string;
  education: string;
  experienceLevel: string;
  relevance: string;
  markedJobs: string[];
  companySize: string;
  salaryRange?: number[] | null;
}

export interface AppliedFiltersProps {
  filterData: FiltersType;
  setFilters: React.Dispatch<React.SetStateAction<FiltersType>>;
}
