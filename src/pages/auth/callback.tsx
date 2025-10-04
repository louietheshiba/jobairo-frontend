import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/utils/supabase';
import toast from 'react-hot-toast';

const AuthCallbackPage = () => {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          router.push('/?error=auth_callback_failed');
          return;
        }

        if (data.session) {
          const user = data.session.user;

          // Get job preferences from user metadata (works across different browsers)
          const pendingPreferences = user.user_metadata?.pending_job_preferences;
          console.log('Pending preferences from user metadata:', pendingPreferences);

          if (pendingPreferences) {
            try {
              console.log('Found job preferences in user metadata:', pendingPreferences);

              // Update the profile with job preferences (profile already exists due to trigger)
              console.log('Updating profile with job preferences...');
              const { error } = await supabase
                .from('profiles')
                .update({
                  job_preferences: pendingPreferences,
                })
                .eq('user_id', user.id);

              if (error) {
                console.error('Failed to save job preferences:', error);
              } else {
                console.log('Job preferences saved successfully from user metadata!');

                // Clean up - remove pending preferences from user metadata
                const { error: updateError } = await supabase.auth.updateUser({
                  data: {
                    pending_job_preferences: null
                  }
                });

                if (updateError) {
                  console.error('Failed to clean up user metadata:', updateError);
                } else {
                  console.log('Cleaned up pending preferences from user metadata');
                }
              }
            } catch (error) {
              console.error('Failed to process job preferences:', error);
            }
          } else {
            console.log('No pending job preferences found in user metadata');
          }

          // Show success toast
          toast.success(`Welcome back, ${user.user_metadata?.full_name || user.user_metadata?.name || 'User'}! 🎉`);

          // Successfully authenticated, redirect to intended page or home
          const redirectUrl = sessionStorage.getItem('auth_redirect_url') || '/';
          sessionStorage.removeItem('auth_redirect_url');
          router.push(redirectUrl);
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        router.push('/?error=unexpected_error');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#319795] mx-auto"></div>
        <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
          Completing authentication...
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Please wait while we sign you in.
        </p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;