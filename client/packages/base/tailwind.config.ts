import type { Config } from 'tailwindcss';

/** @type {import('tailwindcss').Config} */
export default <Partial<Config>>{
  content: [
    './client/**/*.{vue,js,ts,jsx,tsx}',
    './server/**/*.{vue,js,ts,jsx,tsx}',
    './packages/**/!(*node_modules)/**/*.{vue,js,ts,jsx,tsx}',
    './components/**/*.{vue,js,ts,jsx,tsx}',
    './pages/**/*.{vue,js,ts,jsx,tsx}',
  ],
  darkMode: ['selector', '[class*="app-dark"]'],
  plugins: [require('tailwindcss-primeui')],
  theme: {
    borderRadius: {
      none: '0',
      sm: '0.125rem',
      md: '0.19rem',
      DEFAULT: '.25rem',
      lg: '0.5rem',
      full: '9999px',
    },
    screens: {
      'sm': '576px',
      'md': '768px',
      'lg': '992px',
      'xl': '1200px',
      '2xl': '1920px',
    },
  },
};
