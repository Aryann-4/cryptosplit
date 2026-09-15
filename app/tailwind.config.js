/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          0: '#06060a',
          1: '#0c0c14',
          2: '#12121e',
          3: '#1a1a2a',
          4: '#252538',
          5: '#35354a',
        },
        accent: {
          DEFAULT: '#6366f1',
          hover: '#818cf8',
          light: '#a5b4fc',
          dim: '#4f46e5',
        },
        blue: {
          DEFAULT: '#3b82f6',
          hover: '#60a5fa',
        },
        mint: {
          DEFAULT: '#34d399',
          dim: '#10b981',
        },
        cloud: '#f0f0f5',
        ash: '#8F8F99',
        slate: '#a1a1aa',
      },
      fontFamily: {
        sans: ['"Geist"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"Geist Mono"', '"JetBrains Mono"', 'monospace'],
        display: ['"Geist"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '18px',
        '2xl': '24px',
      },
      boxShadow: {
        'glow-accent': '0 0 30px rgba(99, 102, 241, 0.3)',
        'glow-blue': '0 0 30px rgba(59, 130, 246, 0.3)',
        'glow-mint': '0 0 20px rgba(52, 211, 153, 0.2)',
        'card': '0 1px 3px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.2)',
        'card-hover': '0 2px 8px rgba(0,0,0,0.4), 0 12px 32px rgba(0,0,0,0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.35s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(99, 102, 241, 0.4)' },
        },
      },
    },
  },
  plugins: [],
};
