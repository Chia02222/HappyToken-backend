import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'ht-blue': {
          'light': '#E0F7FA',
          'DEFAULT': '#00BCD4',
          'dark': '#00838F',
        },
        'ht-gray': {
          'light': '#F5F5F5',
          'DEFAULT': '#9E9E9E',
          'dark': '#424242',
        }
      }
    },
  },
  plugins: [],
};
export default config;
