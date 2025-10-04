import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabase';

interface UserProfile {
  full_name: string;
  phone: string;
  location: string;
  avatar_url?: string;
  job_preferences?: {
    desired_salary_min?: number;
    desired_salary_max?: number;
    job_types?: string[];
    preferred_locations?: string[];
  };
}

export type { UserProfile };

export const useUserProfile = (user: User | null) => {
  const [profile, setProfile] = useState<UserProfile>({
    full_name: '',
    phone: '',
    location: '',
    avatar_url: '',
    job_preferences: {
      desired_salary_min: undefined,
      desired_salary_max: undefined,
      job_types: [],
      preferred_locations: [],
    },
  });
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    console.log('Loading profile for user:', user.id);

    try {
      // Load from users table
      const { data: userData } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', user.id)
        .single();

      // Load from profiles table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('phone, location, avatar_url, job_preferences')
        .eq('user_id', user.id)
        .single();

      const newProfile = {
        full_name: userData?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || '',
        phone: profileData?.phone || '',
        location: profileData?.location || '',
        avatar_url: profileData?.avatar_url || user.user_metadata?.avatar_url || '',
        job_preferences: profileData?.job_preferences || {
          desired_salary_min: undefined,
          desired_salary_max: undefined,
          job_types: [],
          preferred_locations: [],
        },
      };

      console.log('Setting profile to:', newProfile);
      setProfile(newProfile);
    } catch (error) {
      console.error('Error loading profile:', error);
      // Fallback to auth metadata
      const fallbackProfile = {
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || '',
        phone: '',
        location: '',
        avatar_url: user.user_metadata?.avatar_url || '',
        job_preferences: {
          desired_salary_min: undefined,
          desired_salary_max: undefined,
          job_types: [],
          preferred_locations: [],
        },
      };
      setProfile(fallbackProfile);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return false;

    console.log('Updating profile with:', updates);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          full_name: updates.full_name ?? profile.full_name,
          phone: updates.phone ?? profile.phone,
          location: updates.location ?? profile.location,
          job_preferences: updates.job_preferences ?? profile.job_preferences,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      console.log('Profile updated successfully, reloading data...');
      // Reload profile data from database to ensure consistency
      await loadProfile();
      // Force re-render of all components using this hook
      setRefreshKey(prev => prev + 1);

      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  };

  useEffect(() => {
    loadProfile();
  }, [user]);

  return {
    profile,
    loading,
    loadProfile,
    updateProfile,
    refreshKey,
  };
};