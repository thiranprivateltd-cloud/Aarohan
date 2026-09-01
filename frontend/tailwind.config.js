/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        terracotta: {
          DEFAULT: '#C4623A',
          50: '#F9ECE7',
          100: '#F4D9CF',
          500: '#C4623A',
          600: '#AA4E28',
          700: '#8C3D1D',
        },
        warmcream: {
          DEFAULT: '#FDF6EC',
          50: '#FFFFFF',
          100: '#FDF6EC',
          200: '#F9EAD4',
        },
        forestgreen: {
          DEFAULT: '#2F5233',
          50: '#EAF3EC',
          500: '#2F5233',
          600: '#244127',
        },
      },
      fontFamily: {
        lexend: ['Lexend', 'sans-serif'],
        nunito: ['Nunito', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
