/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'ht-blue': {
          light: '#E0F7FA',
          DEFAULT: '#00BCD4',
          dark: '#00838F',
        },
        'ht-gray': {
          light: '#F5F5F5',
          DEFAULT: '#9E9E9E',
          dark: '#424242',
        },
      },
    },
  },
};

export default config;
