/* eslint-disable import/no-extraneous-dependencies */
import { useCallback, useState } from 'react';
import { getTrackBackground, Range } from 'react-range';

type RangePickerProps = {
  min?: number;
  max?: number;
  step?: number;
  onChange?: (values: number[]) => void;
  selectedValue: [number, number];
};

const RangePicker: React.FC<RangePickerProps> = ({
  min = 0,
  max = 1000,
  step = 1,
  onChange,
  selectedValue,
}) => {
  const [values, setValues] = useState<number[]>([
    selectedValue[0],
    selectedValue[1],
  ]);

  const handleChange = useCallback(
    (newValues: number[]) => {
      if (newValues.length === 2) {
        setValues(newValues as [number, number]);
        if (onChange) onChange(newValues);
      }
    },
    [onChange]
  );

  const handleInputChange = (index: number, value: string) => {
    const newValue = Number(value);
    if (!Number.isNaN(newValue) && newValue >= min && newValue <= max) {
      const newValues = [...values];
      newValues[index] = newValue;
      setValues(newValues);
      if (onChange) onChange(newValues);
    }
  };

  return (
    <div className="flex w-full flex-col items-center">
      <div className="mb-2 flex w-full items-center justify-between gap-2">
        <input
          type="number"
          className="w-full rounded border border-gray-300 bg-transparent p-1 text-center text-sm dark:border-dark-15 dark:text-white"
          value={values[0]}
          onChange={(e) => handleInputChange(0, e.target.value)}
        />
        <span className="text-xs dark:text-white">K</span>
        <input
          type="number"
          className="w-full rounded border border-gray-300 bg-transparent p-1 text-center text-sm dark:border-dark-15 dark:text-white"
          value={values[1]}
          onChange={(e) => handleInputChange(1, e.target.value)}
        />
        <span className="text-xs dark:text-white">K</span>
      </div>
      <div className="relative w-full">
        <Range
          step={step}
          min={min}
          max={max}
          values={values}
          onChange={handleChange}
          renderTrack={({ props, children }) => (
            <div
              {...props}
              className="h-2 w-full rounded bg-gray-200"
              style={{
                background: getTrackBackground({
                  values,
                  colors: ['#ccc', '#19d57a', '#ccc'],
                  min,
                  max,
                }),
              }}
            >
              {children}
            </div>
          )}
          renderThumb={({ props }) => (
            <div
              {...props}
              className="h-5 w-5 rounded-full bg-primary-10 shadow-md focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          )}
        />
      </div>
      <div className="mt-2 flex w-full justify-between text-sm text-gray-600">
        <span>${values[0]}K</span>
        <span>${values[1]}K</span>
      </div>
    </div>
  );
};

export default RangePicker;
