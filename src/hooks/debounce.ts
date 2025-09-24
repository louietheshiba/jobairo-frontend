import { useCallback, useState } from 'react';

// Custom debounce hook
const useDebounce = (callback: any, delay: number) => {
  const [timeoutId, setTimeoutId] = useState(null);

  const debouncedCallback = useCallback(
    (value: any) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const newTimeoutId: any = setTimeout(() => {
        callback(value);
      }, delay);

      setTimeoutId(newTimeoutId);
    },
    [callback, timeoutId, delay]
  );

  return debouncedCallback;
};

export default useDebounce;
