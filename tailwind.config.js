/** @type {import('tailwindcss').Config} */
import lineClamp from '@tailwindcss/line-clamp';

export default {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontFamily: {
      roboto: 'Roboto',
      poppins: 'Poppins',
    },

    extend: {
      colors: {
        primary: {
          10: '#319795',
          15: '#38A169',
        },
        themeGray: {
          5: '#F5F5F5',
          10: '#CCCCCC',
          15: '#666666',
        },
        dark: {
          5: '#8b8b8b',
          10: '#717171',
          15: '#575757',
          20: '#3f3f3f',
          25: '#282828',
          30: '#121212',
        },
        secondary: '#333333',
      },
      boxShadow: {
        card: '0px 0px 20px 3px rgba(0,0,0,0.05)',
      },
    },
  },
  plugins: [lineClamp],
};
