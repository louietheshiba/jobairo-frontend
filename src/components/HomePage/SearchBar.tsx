import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

import type { Option } from '@/types/FiltersType';
import { SUGGETIONS } from '@/utils/constant';

interface SearchBarProps {
  onSearch: (query: string) => void;
  handleChange: (key: string, value: any) => void;
}

const SearchBar = ({ onSearch, handleChange }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Option[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [jobCount, setJobCount] = useState(50000);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [hasSelected, setHasSelected] = useState(false);
  const [isExactMatch, setIsExactMatch] = useState(false);
  const onSearchRef = useRef(onSearch);

  // Update ref when onSearch changes
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  // Debounce the query value
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (debouncedQuery.length > 0) {
      const filtered = SUGGETIONS.filter((s) =>
        s.label && typeof s.label === 'string' && s.label.toLowerCase().includes(debouncedQuery.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
      const exact = filtered.some(s => s.label === debouncedQuery);
      setIsExactMatch(exact);
      if (hasSelected) {
        setShowSuggestions(false);
        setHasSelected(false);
      } else {
        setShowSuggestions(filtered.length > 0 && !exact);
      }
      onSearchRef.current(debouncedQuery); // Trigger search on type
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsExactMatch(false);
      onSearchRef.current(''); // Clear search if empty
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
    onSearchRef.current(query);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleSuggestionClick = (suggestion: Option) => {
    setQuery(suggestion.label);
    handleChange('position', suggestion.label);
    onSearchRef.current(suggestion.label);
    setShowSuggestions(false);
    setSuggestions([]);
    setHasSelected(true);
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(!!suggestions.length && !isExactMatch)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
            placeholder="Search for jobs..."
            className="w-full rounded-full border-2 border-gray-300 bg-white px-6 py-4 pr-20 text-lg shadow-lg focus:border-primary-10 focus:outline-none dark:border-dark-15 dark:bg-dark-25 dark:text-white dark:focus:border-primary-10"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              type="submit"
              className="rounded-full bg-primary-10 p-2 text-white hover:bg-primary-15"
            >
              <Search size={16} />
            </button>
          </div>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full z-10 mt-2 w-full rounded-lg border border-gray-300 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onMouseDown={() => handleSuggestionClick(suggestion)}
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