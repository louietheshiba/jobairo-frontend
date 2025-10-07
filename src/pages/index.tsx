import React, { useState, useCallback } from 'react';
import JobList from '@/components/HomePage/JobList';
import LiveJobs from '@/components/HomePage/LiveJobs';
import { Meta } from '@/layouts/Meta';
import { Main } from '@/templates/Main';
import type { FiltersType, Option } from '@/types/FiltersType';
import { INITIAL_FILTERS } from '@/utils/constant';

const HomePage = () => {
  const [filters, setFilters] = useState<FiltersType>(INITIAL_FILTERS);

  const handleChange = useCallback((
    key: string,
    selected: Option[] | Option | string | string[] | number[] | null
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: selected,
    }));
  }, []);

  return (
    <Main meta={<Meta title="Job Airo" description="Job Airo" />}>
      <LiveJobs
        setFilters={setFilters}
        filters={filters}
        handleChange={handleChange}
      />
      <JobList filters={filters} handleChange={handleChange} />
    </Main>
  );
};

export default HomePage;
