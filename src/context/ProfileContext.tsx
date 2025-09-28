import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabase';

interface UserProfile {
  full_name: string;
  phone: string;
  location: string;
  avatar_url?: string;
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
  });
  const [loading, setLoading] = useState(true);

  // Get user from Supabase auth
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
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
      });
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
        .select('phone, location, avatar_url')
        .eq('user_id', user.id)
        .single();

      const newProfile = {
        full_name: userData?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || '',
        phone: profileData?.phone || '',
        location: profileData?.location || '',
        avatar_url: profileData?.avatar_url || user.user_metadata?.avatar_url || '',
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