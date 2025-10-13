import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Session user ID:', session?.user?.id); // Debug log
      setSession(session);
      setUser(session?.user ?? null);

      // Fetch user role from profiles table based on authenticated user ID
      if (session?.user) {
        console.log('Fetching profile for user ID:', session.user.id); // Debug log
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('role')  // Only select role for faster query
          .eq('user_id', session.user.id)
          .single();

        console.log('User role from profile:', profileData?.role); // Debug log
        console.log('Profile fetch error:', error); // Debug log

        if (error) {
          console.error('Error fetching user role:', error);
          setUserRole('job_seeker'); // Default role
        } else {
          setUserRole(profileData?.role || 'job_seeker');
        }
      } else {
        setUserRole(null);
      }

      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Fetch user role from profiles table on auth state change
        if (session?.user) {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('role')  // Only select role for faster query
            .eq('user_id', session.user.id)
            .single();

          console.log('Auth state change - User role:', profileData?.role); // Debug log

          if (error) {
            console.error('Error fetching user role:', error);
            setUserRole('job_seeker'); // Default role
          } else {
            setUserRole(profileData?.role || 'job_seeker');
          }
        } else {
          setUserRole(null);
        }

        setLoading(false);

        if (event === 'TOKEN_REFRESHED') {
          console.log('Session refreshed');
        }

        if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
          setUserRole(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem('auth_redirect_url');
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { data, error };
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    return { data, error };
  };

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/login/reset-password`,
    });
    return { data, error };
  };

  const updatePassword = async (password: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password: password
    });
    return { data, error };
  };

  return {
    user,
    session,
    userRole,
    loading,
    signOut,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    resetPassword,
    updatePassword,
  };
};