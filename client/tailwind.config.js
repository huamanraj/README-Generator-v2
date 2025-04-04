// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        tomorrow: ["'Tomorrow'", "sans-serif"],
        inter: ["'Inter'", "sans-serif"],
      },
      colors: {
        primary: "#FFB545", // Orange from the design
        dark: "#111111",
        darker: "#080808",
      }
    },
  },
  plugins: [],
}