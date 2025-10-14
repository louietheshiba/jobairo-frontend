import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/context/ProfileContext';
import { supabase } from '@/utils/supabase';

const DebugAuthStatus = () => {
  const { user, session, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, refreshProfile } = useProfile();

  const refresh = async () => {
    try {
      console.log('Refreshing session...');
      const { data } = await supabase.auth.getSession();
      console.log('Supabase session:', data);
      await refreshProfile();
      window.location.reload();
    } catch (e) {
      console.error('Refresh failed:', e);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Debug</h1>
      <div className="mb-4">
        <strong>Auth loading:</strong> {String(authLoading)}
      </div>
      <div className="mb-4">
        <strong>Profile loading:</strong> {String(profileLoading)}
      </div>
      <div className="mb-4">
        <strong>User:</strong>
        <pre className="bg-gray-100 p-3 rounded mt-2">{JSON.stringify(user, null, 2)}</pre>
      </div>
      <div className="mb-4">
        <strong>Session:</strong>
        <pre className="bg-gray-100 p-3 rounded mt-2">{JSON.stringify(session, null, 2)}</pre>
      </div>
      <div className="mb-4">
        <strong>Profile:</strong>
        <pre className="bg-gray-100 p-3 rounded mt-2">{JSON.stringify(profile, null, 2)}</pre>
      </div>
      <div className="flex gap-3">
        <button onClick={refresh} className="px-4 py-2 bg-[#10b981] text-white rounded">Refresh</button>
        <button onClick={() => supabase.auth.signOut()} className="px-4 py-2 bg-red-600 text-white rounded">Sign Out</button>
      </div>
    </div>
  );
};

export default DebugAuthStatus;
