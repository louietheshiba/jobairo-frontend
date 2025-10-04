import '../styles/global.css';
import { ThemeProvider, useTheme } from '@/context/useTheme';
import { ProfileProvider } from '@/context/ProfileContext';
import SessionManager from '@/components/SessionManager';
import { Toaster } from 'react-hot-toast';

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
      <SessionManager />
      <Component {...pageProps} />
      <ToastWrapper />
    </ProfileProvider>
  </ThemeProvider>
);

export default MyApp;
