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
  <Button className="flex !w-fit items-center justify-center gap-1 whitespace-nowrap !rounded-full !border-primary-10 !bg-[#10b981] !py-1.5 px-[18px] text-sm !text-white dark:!bg-dark-25 dark:hover:!bg-dark-20 active:!bg-[#047857]">
    <p>{label}</p>
    <div onClick={() => onDelete(label)}>
      <X size={18} />
    </div>
  </Button>
);

const AppliedFilters = ({ filterData, setFilters }: AppliedFiltersProps) => {
  const handleDelete = (label: string) => {
    const updatedFilters: any = { ...filterData };
    if (label.startsWith('Location:')) {
      const locationLabel = label.replace('Location: ', '');
      updatedFilters.locations = updatedFilters.locations.filter((loc: any) => loc.label !== locationLabel);
    }
    else if (label.startsWith('Job Type:')) {
      updatedFilters.jobType = '';
    }
    else if (label.startsWith('Company:')) {
      updatedFilters.company = '';
    }
    else if (label.startsWith('Education:')) {
      updatedFilters.education = '';
    }
    else if (label.startsWith('Experience Level:')) {
      updatedFilters.experienceLevel = '';
    }
    else if (label.startsWith('Salary Range:')) {
      updatedFilters.salaryRange = null;
    }
    else if (label.startsWith('Work Setting:')) {
      const workSettingLabel = label.replace('Work Setting: ', '');
      updatedFilters.workSchedule = updatedFilters.workSchedule.filter((ws: any) => ws.label !== workSettingLabel);
    }

    setFilters(updatedFilters);
  };

  const renderChips = () => {
    const chips = [
      ...filterData.locations.map(({ label }) => ({ label })),
      { label: filterData.jobType ? `Job Type: ${filterData.jobType}` : null },
      { label: filterData.company ? `Company: ${filterData.company}` : null },
      { label: filterData.education ? `Education: ${filterData.education}` : null },
      { label: filterData.experienceLevel ? `Experience Level: ${filterData.experienceLevel}` : null },
      { label: filterData.salaryRange ? `Salary Range: $${filterData.salaryRange[0]}K - $${filterData.salaryRange[1]}K` : null },
      ...filterData.workSchedule.map(({ label }) => ({ label: `Work Setting: ${label}` })),
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
      filterData.jobType !== '' ||
      filterData.company !== '' ||
      filterData.education !== '' ||
      filterData.experienceLevel !== '' ||
      filterData.salaryRange !== null ||
      filterData.workSchedule.length > 0
    )
  };

  return (
    <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-end  px-4">
      <div className="flex flex-wrap items-center gap-1">{renderChips()}</div>

      {isFilterApplied() && (
        <button
          onClick={handleClearFilters}
          className="flex !w-fit items-center justify-center gap-1 whitespace-nowrap !rounded-full border border-red-600 !bg-white !py-1.5 px-[18px] text-sm !text-red-600 hover:!bg-gray-50 dark:!bg-dark-25 dark:hover:!bg-dark-20"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
};

export default AppliedFilters;
