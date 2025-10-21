import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabase';

interface UserProfile {
  full_name: string;
  is_blocked: boolean;
  role: string;
}

interface ProfileContextType {
  profile: UserProfile | null;
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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        setProfile(null);
      } else {
        console.log("Here is the user profile", data);
        setProfile(data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfile(null);
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
          full_name: updates.full_name ?? profile?.full_name,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      console.log('Profile updated successfully, reloading data...');
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