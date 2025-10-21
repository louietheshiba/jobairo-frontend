import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabase';
import { activityTracker } from '@/utils/activityTracker';
import { useRouter } from 'next/router';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
          
        setUserRole(data?.role ?? 'job_seeker');
        activityTracker.setUserId(session.user.id);
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    };

    getSession();

    // 👇 Listen for login/logout/token refresh
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single()
          .then(({ data }) => {
            setUserRole(data?.role ?? 'job_seeker');
            activityTracker.setUserId(session.user.id);
          });
      } else {
        setUser(null);
        setUserRole(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    sessionStorage.clear();
    router.push('/auth/login');
  };

  return {
    user,
    session,
    userRole,
    loading,
    signOut,
  };
};
