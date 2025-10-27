import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Dark theme surfaces
        'surface-0': '#0B0F14',
        'surface-1': 'rgba(255, 255, 255, 0.03)',
        'surface-2': 'rgba(255, 255, 255, 0.06)',
        'surface-3': 'rgba(255, 255, 255, 0.09)',

        // Text colors
        'text-primary': '#FFFFFF',
        'text-secondary': '#9CA3AF',
        'text-tertiary': '#6B7280',

        // Brand colors
        'brand-primary': '#60A5FA',
        'brand-secondary': '#3B82F6',

        // Status colors
        'status-success': '#10B981',
        'status-warning': '#F59E0B',
        'status-danger': '#EF4444',
        'status-info': '#06B6D4',

        // Borders
        'border-light': 'rgba(255, 255, 255, 0.10)',
        'border-medium': 'rgba(255, 255, 255, 0.15)',
      },
      boxShadow: {
        'elev-1': '0 1px 12px rgba(255, 255, 255, 0.04)',
        'elev-2': '0 6px 30px rgba(255, 255, 255, 0.06)',
        'elev-3': '0 12px 48px rgba(255, 255, 255, 0.08)',
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '12px',
        'lg': '16px',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
    },
  },
  plugins: [],
}
export default config

