/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bubble: "#06b6d4",
        thread: "#a855f7",
        blackspot: "#f59e0b",
        oil: "#f43f5e",
        grain: "#10b981",
      }
    },
  },
  plugins: [],
}

