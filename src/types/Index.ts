import type { FiltersType, Option } from './FiltersType';

export type SaveSearchProps = {
  setFilters: React.Dispatch<React.SetStateAction<FiltersType>>;
  filters: FiltersType;
  handleChange: (
    key: string,
    selected: Option[] | Option | string | string[] | number[] | null
  ) => void;
};
