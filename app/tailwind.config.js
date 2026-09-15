/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          0: '#0a0a0f',
          1: '#12121c',
          2: '#1e1e2e',
          3: '#2a2a3e',
          4: '#3a3a5e',
        },
        gold: {
          DEFAULT: '#fbbf24',
          hover: '#f59e0b',
          light: '#fcd34d',
          dim: '#d97706',
          glow: 'rgba(251, 191, 36, 0.3)',
        },
        accent: {
          DEFAULT: '#6366f1',
          light: '#a5b4fc',
        },
        mint: {
          DEFAULT: '#34d399',
          dim: '#10b981',
        },
        cloud: '#f0f0f5',
        ash: '#8F8F99',
      },
      fontFamily: {
        sans: ['"Geist"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"Geist Mono"', '"JetBrains Mono"', 'monospace'],
        display: ['"Geist"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
        full: '9999px',
      },
      boxShadow: {
        'gold-glow': '0 0 30px rgba(251, 191, 36, 0.3), 0 4px 12px rgba(0, 0, 0, 0.2)',
        'gold-glow-lg': '0 0 40px rgba(251, 191, 36, 0.4), 0 8px 24px rgba(0, 0, 0, 0.3)',
        'card': '0 1px 3px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.2)',
        'card-hover': '0 2px 8px rgba(0,0,0,0.4), 0 12px 32px rgba(0,0,0,0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'grad-shift': 'gradShift 4s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(251, 191, 36, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(251, 191, 36, 0.4)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        gradShift: {
          '0%': { backgroundPosition: '0% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
    },
  },
  plugins: [],
};
