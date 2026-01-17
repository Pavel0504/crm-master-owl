/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        peach: {
          50: '#fff5f0',
          100: '#ffe8dc',
          200: '#ffd1b8',
          300: '#ffb894',
          400: '#ff9f70',
          500: '#ff864c',
          600: '#e6723d',
          700: '#cc5e2e',
          800: '#b34a1f',
          900: '#993610',
        },
        burgundy: {
          50: '#fdf2f4',
          100: '#fce7eb',
          200: '#f9cfd8',
          300: '#f4a8b8',
          400: '#ec7791',
          500: '#e04d6e',
          600: '#c9334f',
          700: '#a92642',
          800: '#8d233d',
          900: '#7a2139',
        },
      },
    },
  },
  plugins: [],
};
