/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        bg:       '#080c14',
        surface:  '#0f1623',
        card:     '#141d2e',
        border:   '#1e2d45',
        accent:   '#2563eb',
        'accent-light': '#3b82f6',
        success:  '#10b981',
        danger:   '#ef4444',
        warn:     '#f59e0b',
        purple:   '#8b5cf6',
        cyan:     '#06b6d4',
        muted:    '#4a6080',
        text:     '#dde4f0',
        'text-dim': '#8899aa',
      },
      animation: {
        'fade-in':   'fadeIn 0.4s ease forwards',
        'slide-up':  'slideUp 0.35s ease forwards',
        'pulse-slow':'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
