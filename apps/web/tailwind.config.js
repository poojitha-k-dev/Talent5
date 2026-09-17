const path = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    path.join(__dirname, 'src/**/*.{js,ts,jsx,tsx,mdx}'),
    path.join(__dirname, '../../packages/ui/**/*.{js,ts,jsx,tsx}'),
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './apps/web/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          50: '#FCFBF9',
          100: '#FAF8F5',
          200: '#F4EFE6',
          300: '#E8E0D1',
          400: '#D6C9B0',
        },
        midnight: {
          950: '#060609',
          900: '#0B0C10',
          800: '#141620',
          700: '#1F2232',
          600: '#2C3046',
        },
        saffron: {
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        },
        peacock: {
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
        },
        sindoor: {
          400: '#FB7185',
          500: '#F43F5E',
          600: '#E11D48',
        },
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        serif: ['DM Serif Display', 'Instrument Serif', 'Georgia', 'serif'],
      },
      boxShadow: {
        saffronGlow: '0 0 25px -4px rgba(245, 158, 11, 0.4)',
        peacockGlow: '0 0 25px -4px rgba(20, 184, 166, 0.35)',
        card: '0 10px 30px -10px rgba(0, 0, 0, 0.6)',
      },
      animation: {
        'wave-pulse': 'wavePulse 1.2s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
      },
      keyframes: {
        wavePulse: {
          '0%, 100%': { height: '20%' },
          '50%': { height: '100%' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: 0.9 },
          '50%': { opacity: 0.4 },
        },
      },
    },
  },
  plugins: [],
};
