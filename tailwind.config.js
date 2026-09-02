/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        vertex: {
          bg: '#050b14',
          panel: '#0b1626',
          panel2: '#0f1e33',
          border: '#1b2c44',
          cyan: '#22d3ee',
          blue: '#3b82f6',
          accent: '#38bdf8',
          warn: '#f59e0b',
          danger: '#ef4444',
          ok: '#22c55e'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        glow: '0 0 25px rgba(34,211,238,0.25)',
        panel: '0 8px 32px rgba(0,0,0,0.45)'
      },
      backdropBlur: {
        xs: '2px'
      }
    }
  },
  plugins: []
}
