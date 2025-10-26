import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { activityTracker } from '@/utils/activityTracker';
import { useRouter } from 'next/router';
import type { User, Session } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      // 🔹 Try local cache first (avoid network delay)
      const cached = sessionStorage.getItem('userSession');
      if (cached) {
        const parsed = JSON.parse(cached);
        setSession(parsed.session);
        setUser(parsed.user);
        setUserRole(parsed.role);
        setLoading(false);
      }

      // 🔹 Always verify with Supabase (async)
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setUser(null);
        setUserRole(null);
        setLoading(false);
        return;
      }

      if (!mounted) return;

      setSession(session);
      setUser(session.user);

      // 🔹 Fetch profile once
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      const role = data?.role ?? 'job_seeker';
      setUserRole(role);
      activityTracker.setUserId(session.user.id);

      // Cache for faster reload
      sessionStorage.setItem('userSession', JSON.stringify({ user: session.user, session, role }));

      setLoading(false);
    };

    loadSession();

    // 🔹 Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setSession(session);
        supabase
          .from('profiles')
          .select('role')
          .eq('user_id', session.user.id)
          .single()
          .then(({ data }) => {
            const role = data?.role ?? 'job_seeker';
            setUserRole(role);
            activityTracker.setUserId(session.user.id);
            sessionStorage.setItem('userSession', JSON.stringify({ user: session.user, session, role }));
          });
      } else {
        setUser(null);
        setSession(null);
        setUserRole(null);
        sessionStorage.removeItem('userSession');
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    sessionStorage.clear();
    router.push('/auth/login');
  };

  return { user, session, userRole, loading, signOut };
};
