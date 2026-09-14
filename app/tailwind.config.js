/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        shell: {
          0: '#09090B',
          1: '#101010',
          2: '#171717',
          3: '#191919',
          4: '#27272A',
          5: '#3F3F46',
        },
        action: {
          DEFAULT: '#0033FF',
          hover: '#0029CC',
          light: '#3366FF',
        },
        mint: {
          DEFAULT: '#99FFE4',
          dim: '#66CCB3',
        },
        cloud: '#F4F4F5',
        ash: '#8F8F99',
        slate: '#A1A1AA',
      },
      fontFamily: {
        sans: ['"Geist"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"Geist Mono"', '"JetBrains Mono"', 'monospace'],
        display: ['"Geist"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '10px',
      },
      boxShadow: {
        none: 'none',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
