/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#22c55e', // Green
          dark: '#16a34a',
          light: '#4ade80',
        },
        secondary: {
          DEFAULT: '#0ea5e9', // Sky blue
          dark: '#0284c7',
          light: '#38bdf8',
        },
        background: {
          DEFAULT: '#f8fafc',
          dark: '#1e293b',
        },
      },
    },
  },
  plugins: [],
}