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
      colors: {
        // Semantic theme colors backed by CSS variables (RGB channel format for opacity support)
        base:    'rgb(var(--c-base) / <alpha-value>)',
        card:    'rgb(var(--c-card) / <alpha-value>)',
        raised:  'rgb(var(--c-raised) / <alpha-value>)',
        overlay: 'rgb(var(--c-overlay) / <alpha-value>)',
        hi:      'rgb(var(--c-hi) / <alpha-value>)',
        mid:     'rgb(var(--c-mid) / <alpha-value>)',
        lo:      'rgb(var(--c-lo) / <alpha-value>)',
        line:    'rgb(var(--c-line) / <alpha-value>)',
        amber:   { 500: '#f59e0b' },
        emerald: { 500: '#10b981' },
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
