import React, { createContext, useContext, useState, useEffect } from 'react';
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

interface ProfileContextType {
  profile: UserProfile;
  loading: boolean;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

interface ProfileProviderProps {
  children: React.ReactNode;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
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

  // Get user from Supabase auth
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async () => {
    if (!user) {
      setProfile({
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
      setLoading(false);
      return;
    }

    console.log('Loading profile for user:', user.id);

    // Retry logic to avoid transient DB/network errors causing sign-out
    const maxAttempts = 2;
    let attempt = 0;
    let lastError: any = null;

    while (attempt < maxAttempts) {
      try {
        // Primary load attempt
        attempt += 1;
        // Load from users table with blocked status
        const { data: userData, error: userErr } = await supabase
          .from('users')
          .select('full_name, is_blocked')
          .eq('id', user.id)
          .single();

        if (userErr) {
          throw userErr;
        }

        // Check if user is blocked
        if (userData?.is_blocked) {
          console.log('User is blocked, signing out...');
          // Sign out the blocked user
          await supabase.auth.signOut();
          // Import toast dynamically to avoid SSR issues
          const { default: toast } = await import('react-hot-toast');
          toast.error('Your account is blocked. Please contact support.', {
            duration: 6000,
            style: {
              background: '#FEE2E2',
              color: '#DC2626',
              border: '1px solid #FECACA',
            },
          });
          setLoading(false);
          return;
        }

        // User is not blocked, continue with normal profile loading
        const { data: profileData, error: profileErr } = await supabase
          .from('profiles')
          .select('phone, location, avatar_url, job_preferences')
          .eq('user_id', user.id)
          .single();

        if (profileErr && profileErr.code !== 'PGRST116') {
          // PGRST116 = no rows found; treat as empty profile rather than an error
          throw profileErr;
        }

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
        setLoading(false);
        return;
      } catch (err) {
        lastError = err;
        console.warn(`Profile load attempt ${attempt} failed:`, err);
        // small backoff before retry
        await new Promise(res => setTimeout(res, 300 * attempt));
      }
    }

    // All attempts failed: fall back to auth metadata but don't sign out the user
    console.error('Failed to load profile after retries:', lastError);
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
    setLoading(false);
    return;
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

      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  };

  const refreshProfile = async () => {
    await loadProfile();
  };

  useEffect(() => {
    loadProfile();
  }, [user]);

  const value = {
    profile,
    loading,
    updateProfile,
    refreshProfile,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};