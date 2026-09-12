// ==========================================
// TALENT5 DESIGN SYSTEM & TOKEN DEFINITIONS
// ==========================================

export const TALENT5_THEME = {
  colors: {
    // Base backgrounds
    midnight: {
      950: '#060609', // Pitch Midnight
      900: '#0B0C10', // Deep Obsidian Body
      800: '#141620', // Card Surface
      700: '#1F2232', // Border / Divider
      600: '#2C3046', // Muted Border
    },
    // Royal Saffron & Sun Gold (Indian Energy)
    saffron: {
      50: '#FFF8EB',
      100: '#FEEFC7',
      300: '#FCD34D',
      400: '#FBBF24',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
      glow: 'rgba(245, 158, 11, 0.4)',
    },
    // Peacock Teal & Emerald (Vibrant Indian Cultural Harmony)
    peacock: {
      400: '#2DD4BF',
      500: '#14B8A6',
      600: '#0D9488',
      700: '#0F766E',
      glow: 'rgba(20, 184, 166, 0.35)',
    },
    // Sindoor Crimson & Rose (Passion & Accents)
    sindoor: {
      400: '#FB7185',
      500: '#F43F5E',
      600: '#E11D48',
      glow: 'rgba(225, 29, 72, 0.35)',
    },
    // Glassmorphism overlays
    glass: {
      card: 'rgba(20, 22, 32, 0.75)',
      nav: 'rgba(11, 12, 16, 0.88)',
      modal: 'rgba(11, 12, 16, 0.94)',
      border: 'rgba(255, 255, 255, 0.08)',
      borderHover: 'rgba(245, 158, 11, 0.4)',
    }
  },
  typography: {
    fontDisplay: "'Outfit', sans-serif",
    fontBody: "'Plus Jakarta Sans', sans-serif",
  },
  shadows: {
    saffronGlow: '0 0 25px -4px rgba(245, 158, 11, 0.4)',
    peacockGlow: '0 0 25px -4px rgba(20, 184, 166, 0.35)',
    card: '0 10px 30px -10px rgba(0, 0, 0, 0.6)',
  }
};

export const BADGE_STYLES = {
  verifiedArtist: 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border border-amber-500/30',
  approvedCreator: 'bg-gradient-to-r from-teal-500/20 to-emerald-500/20 text-teal-300 border border-teal-500/30',
  desiOriginal: 'bg-gradient-to-r from-rose-500/20 to-orange-500/20 text-rose-300 border border-rose-500/30',
  rightsVerified: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  rightsExpired: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
  rightsRestricted: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
};
