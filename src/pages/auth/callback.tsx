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

          // Check if user exists in public.users, if not, insert
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('id', user.id)
            .single();

          if (!existingUser) {
            // Insert into users table
            await supabase.from('users').insert({
              id: user.id,
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email,
            });
          }

          // Check if profile exists, if not, insert
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', user.id)
            .single();

          if (!existingProfile) {
            // Insert into profiles table
            await supabase.from('profiles').insert({
              user_id: user.id,
              avatar_url: user.user_metadata?.avatar_url,
            });
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