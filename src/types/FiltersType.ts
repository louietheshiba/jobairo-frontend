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
  salaryRange: [number, number] | null;
  education: string;
  experienceLevel: string;
  relevance: string;
  datePosted: string;
  markedJobs: string[];
  companySize: string;
}

export interface AppliedFiltersProps {
  filterData: FiltersType;
  setFilters: React.Dispatch<React.SetStateAction<FiltersType>>;
}
