/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        bebas: ['Bebas Neue', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        amber:   { 500: '#f59e0b' },
        emerald: { 500: '#10b981' },
      },
      dropShadow: {
        amber: '0 0 20px rgba(245,158,11,0.6)',
        'amber-sm': '0 0 8px rgba(245,158,11,0.4)',
      },
    },
  },
  plugins: [],
}
