/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)", 
          dark: "var(--color-primary-dark)",
          light: "var(--color-primary-light)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)", 
          dark: "var(--color-secondary-dark)",
          light: "var(--color-secondary-light)",
        },
        background: {
          DEFAULT: "var(--color-background)",
          dark: "var(--color-background-dark)",
        },
      },
    },
  },
  plugins: [],
};
