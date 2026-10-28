/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        horror: {
          950: '#070709',
          900: '#0b0b0e',
          850: '#111116',
          800: '#17171e',
          750: '#1d1d26',
          700: '#262632',
          600: '#383848',
          500: '#525266',
          400: '#7e7e94',
          300: '#adadbfa',
          200: '#d4d4e0',
          100: '#ebebf2',
        },
        blood: {
          950: '#2b0404',
          900: '#450a0a',
          800: '#7f1d1d',
          700: '#991b1b',
          600: '#b91c1c',
          500: '#dc2626',
          400: '#ef4444',
          300: '#f87171',
          200: '#fca5a5',
          100: '#fee2e2',
        }
      },
      fontFamily: {
        cinzel: ['"Cinzel"', 'serif'],
        serif: ['"EB Garamond"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'blood-glow': '0 0 25px -5px rgba(185, 28, 28, 0.25)',
        'blood-glow-lg': '0 0 40px -5px rgba(220, 38, 38, 0.35)',
        'creepy-inner': 'inset 0 0 40px rgba(0, 0, 0, 0.85)',
      },
      keyframes: {
        fog: {
          '0%, 100%': { transform: 'translateX(-5%) translateY(0) scale(1.05)' },
          '50%': { transform: 'translateX(5%) translateY(-2%) scale(1)' },
        },
        flicker: {
          '0%, 100%': { opacity: '0.97' },
          '25%': { opacity: '0.88' },
          '45%': { opacity: '0.94' },
          '70%': { opacity: '0.82' },
          '85%': { opacity: '0.96' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: '0.2' },
          '50%': { opacity: '0.45' },
        },
        inkBleed: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        }
      },
      animation: {
        fog: 'fog 24s ease-in-out infinite',
        flicker: 'flicker 4s ease-in-out infinite',
        pulseSlow: 'pulseSlow 6s ease-in-out infinite',
        inkBleed: 'inkBleed 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }
    },
  },
  plugins: [],
}
