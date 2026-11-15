/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/client/**/*.{html,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        reddit: '#FF4500',
        noir: {
          bg: '#0B0F19',
          card: '#161F30',
          border: '#2A374E',
          accent: '#6366F1',
        },
      },
      keyframes: {
        revealPop: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-6px)' },
          '40%, 80%': { transform: 'translateX(6px)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
      animation: {
        'reveal-pop': 'revealPop 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'shake': 'shake 0.4s ease-in-out',
        'scanline': 'scanline 2s linear infinite',
      },
    },
  },
  plugins: [],
};
