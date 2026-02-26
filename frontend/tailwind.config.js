import typography from '@tailwindcss/typography';
import containerQueries from '@tailwindcss/container-queries';
import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['index.html', 'src/**/*.{js,ts,jsx,tsx,html,css}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Courier New', 'Courier', 'monospace'],
      },
      colors: {
        border: 'oklch(var(--border))',
        input: 'oklch(var(--input))',
        ring: 'oklch(var(--ring) / <alpha-value>)',
        background: 'oklch(var(--background))',
        foreground: 'oklch(var(--foreground))',
        primary: {
          DEFAULT: 'oklch(var(--primary) / <alpha-value>)',
          foreground: 'oklch(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'oklch(var(--secondary) / <alpha-value>)',
          foreground: 'oklch(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'oklch(var(--destructive) / <alpha-value>)',
          foreground: 'oklch(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'oklch(var(--muted) / <alpha-value>)',
          foreground: 'oklch(var(--muted-foreground) / <alpha-value>)'
        },
        accent: {
          DEFAULT: 'oklch(var(--accent) / <alpha-value>)',
          foreground: 'oklch(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'oklch(var(--popover))',
          foreground: 'oklch(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'oklch(var(--card))',
          foreground: 'oklch(var(--card-foreground))'
        },
        chart: {
          1: 'oklch(var(--chart-1))',
          2: 'oklch(var(--chart-2))',
          3: 'oklch(var(--chart-3))',
          4: 'oklch(var(--chart-4))',
          5: 'oklch(var(--chart-5))'
        },
        sidebar: {
          DEFAULT: 'oklch(var(--sidebar))',
          foreground: 'oklch(var(--sidebar-foreground))',
          primary: 'oklch(var(--sidebar-primary))',
          'primary-foreground': 'oklch(var(--sidebar-primary-foreground))',
          accent: 'oklch(var(--sidebar-accent))',
          'accent-foreground': 'oklch(var(--sidebar-accent-foreground))',
          border: 'oklch(var(--sidebar-border))',
          ring: 'oklch(var(--sidebar-ring))'
        },
        brand: {
          blue: {
            deep:  '#002d5c',
            navy:  '#0a4a8a',
            mid:   '#1565c0',
            light: '#1e88e5',
            pale:  '#bbdefb',
          },
          gold: {
            DEFAULT: '#f59e0b',
            light:   '#fbbf24',
            pale:    '#fde68a',
          },
          silver: {
            DEFAULT: '#b0bec5',
            light:   '#cfd8dc',
          }
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0, 45, 92, 0.35), inset 0 1px 0 rgba(255,255,255,0.5)',
        'glass-lg': '0 16px 56px rgba(0, 45, 92, 0.45), inset 0 1px 0 rgba(255,255,255,0.6)',
        'glow-gold': '0 6px 24px rgba(245, 158, 11, 0.55)',
        'glow-blue': '0 6px 24px rgba(21, 101, 192, 0.55)',
        'glow-gold-lg': '0 10px 36px rgba(245, 158, 11, 0.65)',
      },
      keyframes: {
        'float': {
          '0%, 100%': { transform: 'translateY(0px) rotate(-1deg)' },
          '50%':      { transform: 'translateY(-10px) rotate(1deg)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'pop': {
          '0%':   { opacity: '0', transform: 'scale(0.7)' },
          '70%':  { transform: 'scale(1.05)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-up': {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'ripple': {
          '0%':   { transform: 'scale(1)', opacity: '0.7' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        'draw-check': {
          'to': { strokeDashoffset: '0' },
        },
        'coin-bounce': {
          '0%':   { opacity: '0', transform: 'translateY(20px) scale(0.5)' },
          '60%':  { transform: 'translateY(-6px) scale(1.1)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'spin': {
          'to': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'float':       'float 3.2s ease-in-out infinite',
        'shimmer':     'shimmer 2.5s linear infinite',
        'pop':         'pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'slide-up':    'slide-up 0.5s ease both',
        'ripple':      'ripple 1.8s ease-out infinite',
        'coin-bounce': 'coin-bounce 0.6s ease both',
        'spin':        'spin 0.7s linear infinite',
      },
    }
  },
  plugins: [typography, containerQueries, animate],
};
