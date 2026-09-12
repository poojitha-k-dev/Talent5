/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
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
