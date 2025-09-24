import '../styles/global.css';

import { ThemeProvider } from '@/context/useTheme';

const MyApp = ({ Component, pageProps }: any) => (
  <ThemeProvider>
    <Component {...pageProps} />
  </ThemeProvider>
);

export default MyApp;
