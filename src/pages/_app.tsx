import '../styles/global.css';

import { ThemeProvider } from '@/context/useTheme';
import SessionManager from '@/components/SessionManager';

const MyApp = ({ Component, pageProps }: any) => (
  <ThemeProvider>
    <SessionManager />
    <Component {...pageProps} />
  </ThemeProvider>
);

export default MyApp;
