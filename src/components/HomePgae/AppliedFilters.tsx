import { X } from 'lucide-react';

import type { AppliedFiltersProps } from '@/types/FiltersType';
import { INITIAL_FILTERS } from '@/utils/constant';

import { Button } from '../ui/button';

const Chip = ({
  label,
  onDelete,
}: {
  label: string;
  onDelete: (label: string) => void;
}) => (
  <Button className="flex !w-fit items-center justify-center gap-1 whitespace-nowrap !rounded-full !border-primary-10 !bg-white !py-1.5 px-[18px] text-sm !text-primary-10 dark:!bg-dark-25 dark:hover:!bg-dark-20">
    <p>{label}</p>
    <div onClick={() => onDelete(label)}>
      <X size={18} />
    </div>
  </Button>
);

const AppliedFilters = ({ filterData, setFilters }: AppliedFiltersProps) => {
  const handleDelete = (label: string) => {
    const updatedFilters: any = { ...filterData };

    Object.keys(updatedFilters).forEach((key) => {
      const value = updatedFilters[key];

      if (typeof value === 'string' && value === label) {
        updatedFilters[key] = '';
      } else if (Array.isArray(value) && key === 'salaryRange') {
        updatedFilters.salaryRange = null;
      } else if (Array.isArray(value)) {
        updatedFilters[key] = value.filter((item) =>
          item?.label ? item?.label !== label : item !== label
        );
      }
    });

    setFilters(updatedFilters);
  };

  const renderChips = () => {
    const chips = [
      ...filterData.locations.map(({ label }) => ({ label })),
      ...filterData.workSchedule.map(({ label }) => ({ label })),
      ...filterData.markedJobs.map((job) => ({ label: job })),
      { label: filterData.jobType },
      {
        label: filterData.salaryRange
          ? `Salary Range: $${filterData.salaryRange[0]} - $${filterData.salaryRange[1]}`
          : null,
      },
      { label: filterData.education },
      { label: filterData.experienceLevel },
    ];

    return chips.map((chip, index) =>
      chip.label ? (
        <Chip key={index} label={chip.label} onDelete={handleDelete} />
      ) : null
    );
  };

  const handleClearFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const isFilterApplied = () => {
    return (
      filterData.locations.length > 0 ||
      filterData.workSchedule.length > 0 ||
      filterData.jobType !== '' ||
      filterData.salaryRange !== null ||
      filterData.education !== '' ||
      filterData.experienceLevel !== '' ||
      filterData.relevance !== 'Relevance' ||
      filterData.datePosted !== 'Date Posted' ||
      filterData.markedJobs.length > 0
    );
  };

  return (
    <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
      <div className="flex flex-wrap items-center gap-1">{renderChips()}</div>

      {isFilterApplied() && (
        <Button
          onClick={handleClearFilters}
          className="flex !w-fit items-center justify-center gap-1 whitespace-nowrap !rounded-full !border-red-600 !bg-white !py-1.5 px-[18px] text-sm !text-red-600 dark:!bg-dark-25 dark:hover:!bg-dark-20"
        >
          Clear Filters
        </Button>
      )}
    </div>
  );
};

export default AppliedFilters;
