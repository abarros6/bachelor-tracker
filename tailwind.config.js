/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090b',
        surface: '#18181b',
        elevated: '#27272a',
        amber: { 500: '#f59e0b' },
        emerald: { 500: '#10b981' },
        red: { 500: '#ef4444' },
      },
      fontFamily: {
        bebas: ['Bebas Neue', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      dropShadow: {
        amber: '0 0 20px rgba(245,158,11,0.6)',
        'amber-sm': '0 0 8px rgba(245,158,11,0.4)',
      },
    },
  },
  plugins: [],
}

