'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin } from 'lucide-react';
import type { Option } from '@/types/FiltersType';
import { SUGGETIONS } from '@/utils/constant';
import { activityTracker } from '@/utils/activityTracker';

interface OptionWithOccupation extends Option {
  occupation_label?: string;
  skill_label?: string;
  isLocation?: boolean;
  city?: string;
  country?: string;
  admin_name?: string;
}

interface SearchBarProps {
  onSearch: (query: string, location: string) => void;
  handleChange: (key: string, value: any) => void;
}

const SearchBar = ({ onSearch, handleChange }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [jobSuggestions, setJobSuggestions] = useState<OptionWithOccupation[]>([]);
  const [locationSuggestions, setLocationSuggestions] = useState<OptionWithOccupation[]>([]);
  const [showJobSuggestions, setShowJobSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [jobCount, setJobCount] = useState(50000);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [debouncedLocation, setDebouncedLocation] = useState('');
  const [hasSelected, setHasSelected] = useState(false);
  const [isExactMatch, setIsExactMatch] = useState(false);
  const jobCacheRef = useRef<Record<string, OptionWithOccupation[]>>({});
  const locationCacheRef = useRef<Record<string, OptionWithOccupation[]>>({});
  const onSearchRef = useRef(onSearch);

  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  // Debounce job query
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 150);
    return () => clearTimeout(timer);
  }, [query]);

  // Debounce location query
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedLocation(location.trim()), 150);
    return () => clearTimeout(timer);
  }, [location]);

  // Fetch job/skill suggestions
  useEffect(() => {
    const fetchJobSuggestions = async () => {
      if (!debouncedQuery) {
        setJobSuggestions([]);
        setShowJobSuggestions(false);
        setIsExactMatch(false);
        return;
      }

      let localSuggestions = SUGGETIONS.filter((s) =>
        s.label?.toLowerCase().includes(debouncedQuery.toLowerCase())
      ).slice(0, 5);

      if (jobCacheRef.current[debouncedQuery]) {
        setJobSuggestions(jobCacheRef.current[debouncedQuery]);
        setShowJobSuggestions(true);
        return;
      }

      try {
        const res = await fetch(`/api/related-skills?query=${debouncedQuery}`);
        const json = await res.json();
        if (res.ok && Array.isArray(json.results)) {
          const apiSuggestions: OptionWithOccupation[] = json.results.map((item: any) => ({
            id: `${item.skill_label}-${item.occupation_label}`,
            label: item.skill_label,
            occupation_label: item.occupation_label,
            skill_label: item.skill_label,
          }));
          localSuggestions = [...localSuggestions, ...apiSuggestions].slice(0, 10);
        }
      } catch (err) {
        console.error('Job fetch error:', err);
      }

      jobCacheRef.current[debouncedQuery] = localSuggestions;
      setJobSuggestions(localSuggestions);
      setShowJobSuggestions(localSuggestions.length > 0);
      setIsExactMatch(localSuggestions.some((s) => s.label === debouncedQuery));
    };

    fetchJobSuggestions();
  }, [debouncedQuery, hasSelected]);

  // Fetch location suggestions
  useEffect(() => {
    const fetchLocationSuggestions = async () => {
      if (debouncedLocation.length < 2) return;

      if (locationCacheRef.current[debouncedLocation]) {
        setLocationSuggestions(locationCacheRef.current[debouncedLocation]);
        setShowLocationSuggestions(true);
        return;
      }

      try {
        const res = await fetch(`/api/location-search?query=${debouncedLocation}`);
        const json = await res.json();
        if (res.ok && Array.isArray(json.results)) {
          const locSuggestions: OptionWithOccupation[] = json.results.map((item: any) => ({
            id: `${item.city}-${item.country}`,
            label: `${item.city}, ${item.admin_name}, ${item.country}`,
            isLocation: true,
            city: item.city,
            country: item.country,
            admin_name: item.admin_name,
          }));
          locationCacheRef.current[debouncedLocation] = locSuggestions;
          setLocationSuggestions(locSuggestions);
          setShowLocationSuggestions(locSuggestions.length > 0);
        }
      } catch (err) {
        console.error('Location fetch error:', err);
      }
    };

    fetchLocationSuggestions();
  }, [debouncedLocation]);

  // Job count simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setJobCount((prev) => prev + Math.floor(Math.random() * 10));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchRef.current(query, location);
    setShowJobSuggestions(false);
    setShowLocationSuggestions(false);
    setJobSuggestions([]);
    setLocationSuggestions([]);
    if (query || location) {
      activityTracker.trackActivity(`search_${Date.now()}`, 'search', { query, location });
    }
  };

  const handleSuggestionClick = (s: OptionWithOccupation) => {
    if (s.isLocation) {
      setLocation(s.label!);
      handleChange('location', s.label);
    } else {
      setQuery(s.skill_label || s.label);
      handleChange('position', s.skill_label || s.label);
    }
    onSearchRef.current(query, location);
    setShowJobSuggestions(false);
    setShowLocationSuggestions(false);
    setJobSuggestions([]);
    setLocationSuggestions([]);
    setHasSelected(true);
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 md:px-8">
      <form
        onSubmit={handleSubmit}
        className="relative flex flex-col sm:flex-row items-stretch sm:items-center bg-white dark:bg-dark-25 rounded-2xl border border-gray-200 dark:border-dark-15 shadow-md transition-all duration-300 focus-within:border-[#10b981] focus-within:ring-4 focus-within:ring-[#10b981]/20"
      >
        {/* Job/Skill input */}
        <div className="flex items-center flex-1 px-4 py-2 sm:px-5 sm:py-3 relative">
          <Search size={20} className="text-[#10b981] mr-2 sm:mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowJobSuggestions(jobSuggestions.length > 0)}
            onBlur={() => setTimeout(() => setShowJobSuggestions(false), 100)}
            placeholder="Search for jobs or skills..."
            className="w-full bg-transparent outline-none text-base sm:text-lg dark:text-white"
          />
          {showJobSuggestions && jobSuggestions.length > 0 && (
            <div className="absolute top-full mt-1 left-0 w-full rounded-lg border border-gray-300 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 z-20 max-h-60 overflow-auto">
              {jobSuggestions.map((s) => (
                <button
                  key={s.id}
                  onMouseDown={() => handleSuggestionClick(s)}
                  className="w-full px-4 py-2 text-left text-sm sm:text-base hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white transition"
                >
                  {s.occupation_label ? `${s.occupation_label} – ${s.skill_label}` : s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Location input */}
        <div className="flex items-center flex-1 px-4 py-2 sm:px-5 sm:py-3 border-t sm:border-t-0 sm:border-l border-gray-200 dark:border-gray-700 relative">
          <MapPin size={20} className="text-[#10b981] mr-2 sm:mr-3" />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onFocus={() => setShowLocationSuggestions(locationSuggestions.length > 0)}
            onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 100)}
            placeholder="City or state"
            className="w-full bg-transparent outline-none text-base sm:text-lg dark:text-white"
          />
          {showLocationSuggestions && locationSuggestions.length > 0 && (
            <div className="absolute top-full mt-1 left-0 w-full rounded-lg border border-gray-300 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 z-20 max-h-60 overflow-auto">
              {locationSuggestions.map((s) => (
                <button
                  key={s.id}
                  onMouseDown={() => handleSuggestionClick(s)}
                  className="w-full px-4 py-2 text-left text-sm sm:text-base hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white transition"
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search button */}
        <button
          type="submit"
          className="mt-2 sm:mt-0 sm:ml-2 rounded-none md:rounded-r-lg md:rounded-l-none rounded-b-lg md:rounded-b-none bg-[#10b981] px-6 sm:px-8 py-2 sm:py-3 text-white font-semibold text-sm sm:text-lg shadow-md hover:scale-105 hover:shadow-lg transition-all duration-300"
        >
          Search
        </button>
      </form>

      {/* Job counter */}
      <div className="mt-2 text-center">
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          Press Enter to search • Searching {jobCount.toLocaleString()}+ jobs
        </p>
      </div>
    </div>
  );
};

export default SearchBar;
