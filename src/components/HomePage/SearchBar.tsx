import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin } from 'lucide-react';
import type { Option } from '@/types/FiltersType';
import { SUGGETIONS } from '@/utils/constant';
import { activityTracker } from '@/utils/activityTracker';

interface SearchBarProps {
  onSearch: (query: string, location: string) => void;
  handleChange: (key: string, value: any) => void;
}

const SearchBar = ({ onSearch, handleChange }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [suggestions, setSuggestions] = useState<Option[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [jobCount, setJobCount] = useState(50000);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [hasSelected, setHasSelected] = useState(false);
  const [isExactMatch, setIsExactMatch] = useState(false);
  const onSearchRef = useRef(onSearch);

  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (debouncedQuery.length > 0) {
      const filtered = SUGGETIONS.filter(
        (s) =>
          s.label &&
          typeof s.label === 'string' &&
          s.label.toLowerCase().includes(debouncedQuery.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
      const exact = filtered.some((s) => s.label === debouncedQuery);
      setIsExactMatch(exact);
      if (hasSelected) {
        setShowSuggestions(false);
        setHasSelected(false);
      } else {
        setShowSuggestions(filtered.length > 0 && !exact);
      }
      onSearchRef.current(debouncedQuery, location);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsExactMatch(false);
      onSearchRef.current('', location);
    }
  }, [debouncedQuery, location]);

  useEffect(() => {
    const interval = setInterval(() => {
      setJobCount((prev) => prev + Math.floor(Math.random() * 10));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchRef.current(query, location);
    setShowSuggestions(false);
    setSuggestions([]);
    if (query.trim() || location.trim()) {
      activityTracker.trackActivity(`search_${Date.now()}`, 'search', {
        query: query.trim(),
        location: location.trim(),
      });
    }
  };

  const handleSuggestionClick = (suggestion: Option) => {
    setQuery(suggestion.label);
    handleChange('position', suggestion.label);
    onSearchRef.current(suggestion.label, location);
    setShowSuggestions(false);
    setSuggestions([]);
    setHasSelected(true);
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 md:px-8">
      <form
        onSubmit={handleSubmit}
        className="relative flex flex-col sm:flex-row items-stretch sm:items-center bg-white dark:bg-dark-25 rounded-2xl border border-gray-200 dark:border-dark-15 shadow-md transition-all duration-300 focus-within:border-[#10b981] focus-within:ring-4 focus-within:ring-[#10b981]/20"
      >
        {/* 🔍 Search Input */}
        <div className="flex items-center flex-1 px-4 py-2 sm:px-5 sm:py-3">
          <Search size={20} className="text-[#10b981] mr-2 sm:mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(!!suggestions.length && !isExactMatch)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
            placeholder="Search for jobs..."
            className="w-full bg-transparent outline-none text-base sm:text-lg dark:text-white"
          />
        </div>


        {/* 📍 Location Input */}
        <div className="flex items-center flex-1 px-4 py-2 sm:px-5 sm:py-3 border-t sm:border-t-0 sm:border-l border-gray-200 dark:border-gray-700">
          <MapPin size={20} className="text-[#10b981] mr-2 sm:mr-3" />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City or state"
            className="w-full bg-transparent outline-none text-base sm:text-lg dark:text-white"
          />
        </div>

        {/* 🔘 Search Button */}
        <button
          type="submit"
          className="mt-2 sm:mt-0 sm:ml-2   rounded-none
    md:rounded-r-lg       
    md:rounded-l-none     
    rounded-b-lg          
    md:rounded-b-none bg-[#10b981] px-6 sm:px-8 py-2 sm:py-3 text-white font-semibold text-sm sm:text-lg shadow-md hover:scale-105 hover:shadow-lg transition-all duration-300"
        >
          Search
        </button>



        {/* 💡 Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full mt-1 left-0 w-full sm:w-[60%] rounded-lg border border-gray-300 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 z-20">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onMouseDown={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-2 text-left text-sm sm:text-base hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white transition"
              >
                {suggestion.label}
              </button>
            ))}
          </div>
        )}
      </form>

      {/* Job Counter */}
      <div className="mt-2 text-center">
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          Press Enter to search • Searching {jobCount.toLocaleString()}+ jobs
        </p>
      </div>
    </div>
  );
};

export default SearchBar;
