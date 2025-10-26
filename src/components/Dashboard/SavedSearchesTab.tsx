'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/utils/supabase';
import toast from 'react-hot-toast';

interface SavedSearch {
  id: string;
  filters: Record<string, any>;
  created_at: string;
}

const SavedSearchesTab: React.FC = () => {
  const { user } = useAuth();
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedSearches = useCallback(async (showLoading = true) => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    if (showLoading) setLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedSearches(data || []);
    } catch (error) {
      console.error('Error fetching saved searches:', error);
      toast.error('Failed to load saved searches');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) fetchSavedSearches();
    else setLoading(false);
  }, [fetchSavedSearches, user]);

  useEffect(() => {
    const handleTabChange = (event: CustomEvent) => {
      if (event.detail?.tab === 'searches') fetchSavedSearches(false);
    };
    window.addEventListener('tabChanged', handleTabChange as EventListener);
    return () => window.removeEventListener('tabChanged', handleTabChange as EventListener);
  }, [fetchSavedSearches]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        const { error } = await supabase.from('saved_searches').delete().eq('id', id);
        if (error) throw error;

        setSavedSearches(prev => prev.filter(s => s.id !== id));
        toast.success('Search unsaved successfully');
      } catch (error) {
        console.error('Error deleting search:', error);
        toast.error('Failed to delete search');
      }
    },
    []
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary-10"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading saved searches...</p>
        </div>
      </div>
    );
  }

  if (savedSearches.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No Saved Searches</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
          Your saved filter combinations will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between mb-8 gap-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Saved Searches</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Your saved filter combinations ({savedSearches.length})
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {savedSearches.map(search => (
          <div
            key={search.id}
            className="bg-white dark:bg-[#282828] border border-gray-100 dark:border-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                Saved Search
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {Object.entries(search.filters)
                  .map(([key, value]) =>
                    `${key}: ${
                      Array.isArray(value)
                        ? value.map(v => v.label || v).join(', ')
                        : value || 'N/A'
                    }`
                  )
                  .join(' • ')}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <span className="px-2 py-1 bg-primary-10/10 dark:bg-primary-10/20 text-primary-15 dark:text-primary-10 rounded-full text-xs font-medium">
                Saved{' '}
                {new Date(search.created_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
              <button
                onClick={() => handleDelete(search.id)}
                className="px-3 py-1.5 bg-primary-10 text-white text-xs font-medium rounded-md hover:bg-primary-15 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-10 focus:ring-offset-2 dark:focus:ring-offset-dark-20"
              >
                Unsave
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedSearchesTab;
