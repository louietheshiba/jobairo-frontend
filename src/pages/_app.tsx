import '../styles/global.css';
import { ThemeProvider } from '@/context/useTheme';
import { ProfileProvider } from '@/context/ProfileContext';
import SessionManager from '@/components/SessionManager';
import { Toaster } from 'react-hot-toast';

const MyApp = ({ Component, pageProps }: any) => (
  <ThemeProvider>
    <ProfileProvider>
      <SessionManager />
      <Component {...pageProps} />
    </ProfileProvider>
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#363636',
          color: '#fff',
        },
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#10B981',
            secondary: '#fff',
          },
        },
        error: {
          duration: 5000,
          iconTheme: {
            primary: '#EF4444',
            secondary: '#fff',
          },
        },
      }}
    />
  </ThemeProvider>
);

export default MyApp;
