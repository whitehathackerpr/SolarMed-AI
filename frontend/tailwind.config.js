/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0F766E', // Teal shade representing Uganda's natural beauty
          light: '#14B8A6',
          dark: '#0D5453',
        },
        secondary: {
          DEFAULT: '#F59E0B', // Warm yellow representing Uganda's sunshine
          light: '#FBBF24',
          dark: '#D97706',
        },
        accent: {
          DEFAULT: '#7C3AED', // Purple representing Uganda's culture
          light: '#A78BFA',
          dark: '#5B21B6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
