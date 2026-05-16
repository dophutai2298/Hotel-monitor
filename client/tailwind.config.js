/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        status: {
          vacant: '#22c55e',
          occupied: '#3b82f6',
          cleaning: '#f59e0b',
          maintenance: '#ef4444',
          reserved: '#8b5cf6',
        }
      }
    },
  },
  plugins: [],
}
