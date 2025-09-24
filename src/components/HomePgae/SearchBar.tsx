import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

import useDebounce from '@/hooks/debounce';
import type { Option } from '@/types/FiltersType';
import { SUGGETIONS } from '@/utils/constant';

interface SearchBarProps {
  onSearch: (query: string) => void;
  filters: any;
  handleChange: (key: string, value: any) => void;
}

const SearchBar = ({ onSearch, filters, handleChange }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Option[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [jobCount, setJobCount] = useState(50000);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.length > 1) {
      const filtered = SUGGETIONS.filter(s =>
        s.label.toLowerCase().includes(debouncedQuery.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    // Animate job count
    const interval = setInterval(() => {
      setJobCount(prev => prev + Math.floor(Math.random() * 10));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: Option) => {
    setQuery(suggestion.label);
    handleChange('position', suggestion.label);
    onSearch(suggestion.label);
    setShowSuggestions(false);
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(!!suggestions.length)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Search for jobs..."
            className="w-full rounded-full border-2 border-gray-300 bg-white px-6 py-4 pr-12 text-lg shadow-lg focus:border-primary-10 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-primary-10"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-primary-10 p-2 text-white hover:bg-primary-15"
          >
            <Search size={20} />
          </button>
        </div>

        {showSuggestions && (
          <div className="absolute top-full z-10 mt-2 w-full rounded-lg border border-gray-300 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {suggestion.label}
              </button>
            ))}
          </div>
        )}
      </form>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Press Enter to search • Searching {jobCount.toLocaleString()}+ jobs
        </p>
      </div>
    </div>
  );
};

export default SearchBar;