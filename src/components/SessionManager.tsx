import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/utils/supabase';

const SessionManager = () => {
  const { user, session } = useAuth();
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  useEffect(() => {
    if (!user || !session) return;

    // Check if session is close to expiring
    const checkSessionExpiration = () => {
      if (session?.expires_at) {
        const expiresAt = session.expires_at * 1000; // Convert to milliseconds
        const now = Date.now();
        const timeUntilExpiry = expiresAt - now;
        
        // Show warning 5 minutes before expiry
        if (timeUntilExpiry > 0 && timeUntilExpiry <= 5 * 60 * 1000) {
          setShowSessionExpiredModal(true);
        }
      }
    };

    // Track user activity
    const updateActivity = () => {
      setLastActivity(Date.now());
    };

    const activities = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    activities.forEach(activity => {
      document.addEventListener(activity, updateActivity, true);
    });

    // Check session every minute
    const sessionInterval = setInterval(checkSessionExpiration, 60000);

    // Auto-logout after 30 days of inactivity
    const inactivityCheck = setInterval(() => {
      const now = Date.now();
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      
      if (now - lastActivity > thirtyDays) {
        supabase.auth.signOut();
      }
    }, 60000); // Check every minute

    return () => {
      activities.forEach(activity => {
        document.removeEventListener(activity, updateActivity, true);
      });
      clearInterval(sessionInterval);
      clearInterval(inactivityCheck);
    };
  }, [user, session, lastActivity]);

  const handleQuickReLogin = async () => {
    // Attempt to refresh the session
    try {
      const { error } = await supabase.auth.refreshSession();
      if (!error) {
        setShowSessionExpiredModal(false);
      }
    } catch (error) {
      console.error('Failed to refresh session:', error);
    }
  };

  if (!showSessionExpiredModal) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="text-center">
          <div className="mb-4">
            <svg
              className="w-12 h-12 text-yellow-500 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Session Expiring Soon
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your session will expire soon. Would you like to stay logged in?
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={handleQuickReLogin}
              className="flex-1 bg-[#319795] text-white px-4 py-2 rounded-md hover:bg-[#246463] transition-colors"
            >
              Stay Logged In
            </button>
            
            <button
              onClick={() => {
                supabase.auth.signOut();
                setShowSessionExpiredModal(false);
              }}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionManager;