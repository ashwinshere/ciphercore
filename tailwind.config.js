/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        cipher: {
          navy: '#123B63',
          govblue: '#1E5A96',
          accent: '#2F6FAF',
          highlight: '#4C7FAF',
          bg: '#F5F7FA',
          surface: '#FFFFFF',
          card: '#FFFFFF',
          text: '#172033',
          muted: '#667085',
          border: '#D9E1EA',
          borderLight: '#EDF2F7',
          success: '#217A52',
          warning: '#B7791F',
          error: '#B42318',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(18, 59, 99, 0.05), 0 1px 2px -1px rgba(18, 59, 99, 0.05)',
        card: '0 2px 6px -1px rgba(18, 59, 99, 0.06), 0 2px 4px -2px rgba(18, 59, 99, 0.04)',
        elevated: '0 8px 24px -4px rgba(18, 59, 99, 0.08), 0 4px 8px -4px rgba(18, 59, 99, 0.04)',
        modal: '0 20px 35px -5px rgba(18, 59, 99, 0.15), 0 10px 15px -5px rgba(18, 59, 99, 0.08)',
      }
    }
  },
  plugins: []
}
