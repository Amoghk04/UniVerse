/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}', // Scan all JavaScript/TypeScript files in src folder
  ],
  darkMode: 'class', // Enable dark mode
  theme: {
    extend: {
      // Custom theme extensions if needed
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [], // Add Tailwind plugins here if needed
};