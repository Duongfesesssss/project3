import type { Config } from 'tailwindcss';

/** @type {import('tailwindcss').Config} */
export default <Partial<Config>>{
  content: [
    './client/**/*.{vue,js,ts,jsx,tsx}', // Quét tất cả các file trong thư mục client
    './server/**/*.{vue,js,ts,jsx,tsx}', // Quét tất cả các file trong thư mục server
    './packages/**/*.{vue,js,ts,jsx,tsx}', // Quét tất cả các file trong thư mục packages
    './components/**/*.{vue,js,ts,jsx,tsx}', // Các file trong components
    './pages/**/*.{vue,js,ts,jsx,tsx}', // Các file trong pages
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
