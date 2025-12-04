/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        neutralBg: '#f7f7f7',
        neutralCard: '#ffffff'
      }
    }
  },
  plugins: []
};