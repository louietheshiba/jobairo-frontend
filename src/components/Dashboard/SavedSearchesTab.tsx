import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/utils/supabase';
import toast from 'react-hot-toast';

interface SavedSearch {
  id: string;
  filters: any;
  created_at: string;
}

const SavedSearchesTab: React.FC = () => {
  const { user } = useAuth();
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedSearches = async (showLoading = true) => {
    if (!user) {
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

      if (error) {
        console.error('Error fetching saved searches:', error);
        if (showLoading) setLoading(false);
        return;
      }

      setSavedSearches(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSavedSearches();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Listen for tab change events to refresh data when switching to this tab
  useEffect(() => {
    const handleTabChange = (event: CustomEvent) => {
      if (event.detail?.tab === 'searches' && user) {
        fetchSavedSearches(false);
      }
    };

    window.addEventListener('tabChanged', handleTabChange as EventListener);

    return () => {
      window.removeEventListener('tabChanged', handleTabChange as EventListener);
    };
  }, [user]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('saved_searches')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSavedSearches(savedSearches.filter(s => s.id !== id));
      toast.success('Search unsaved successfully');
    } catch (error) {
      console.error('Error deleting search:', error);
      toast.error('Failed to delete search');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-10"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading saved searches...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Saved Searches</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Your saved filter combinations ({savedSearches.length})
        </p>
      </div>

      <div className="space-y-4">
        {savedSearches.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">No saved searches yet</p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Save your filter combinations to reuse them later</p>
          </div>
        ) : (
          savedSearches.map((search) => (
            <div key={search.id} className="bg-white dark:bg-dark-20 rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white hover:text-primary-10 dark:hover:text-primary-10 transition-colors cursor-pointer">
                    Saved Search
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {Object.entries(search.filters).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.map(v => v.label || v).join(', ') : value}`).join(' • ')}
                  </p>
                </div>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium">
                  Saved {new Date(search.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleDelete(search.id)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                >
                  Unsave
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SavedSearchesTab;