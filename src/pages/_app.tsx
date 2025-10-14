import '../styles/global.css';
import { ThemeProvider, useTheme } from '@/context/useTheme';
import { ProfileProvider } from '@/context/ProfileContext';
import SessionManager from '@/components/SessionManager';
import { Toaster } from 'react-hot-toast';
import Header from '@/layouts/Header';
import { useEffect } from 'react';
import { supabase } from '@/utils/supabase';

const ToastWrapper = () => {
  const { isDarkMode } = useTheme();

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: isDarkMode ? '#363636' : '#fff',
          color: isDarkMode ? '#fff' : '#000',
        },
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#10B981',
            secondary: isDarkMode ? '#fff' : '#000',
          },
        },
        error: {
          duration: 5000,
          iconTheme: {
            primary: '#EF4444',
            secondary: isDarkMode ? '#fff' : '#000',
          },
        },
      }}
    />
  );
};

const MyApp = ({ Component, pageProps }: any) => (
  <ThemeProvider>
    <ProfileProvider>
      {/* Auth event logger for debugging session rehydration */}
      <AuthLogger />
      <SessionManager />
      <Header />
      <main className="pt-4">
        <Component {...pageProps} />
      </main>
      <ToastWrapper />
    </ProfileProvider>
  </ThemeProvider>
);

const AuthLogger = () => {
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      console.log('[AuthLogger] initial session:', data.session);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[AuthLogger] event:', event, 'session:', session);
    });

    return () => subscription.unsubscribe();
  }, []);
  return null;
};

export default MyApp;
