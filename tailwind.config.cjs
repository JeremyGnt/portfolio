/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        ink: '#ffffff',
        accent: '#ffd600',
        surface: '#0f1115',
      },
      fontFamily: {
        sans: ['InterLocal', 'system-ui', 'sans-serif'],
        display: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        glass: 'inset 0 1px 0 rgba(255, 255, 255, 0.08), inset 0 -1px 0 rgba(255, 255, 255, 0.02), 0 24px 48px rgba(0, 0, 0, 0.56)',
        'glass-strong': 'inset 0 1px 0 rgba(255, 255, 255, 0.08), inset 0 -1px 0 rgba(255, 255, 255, 0.02), 0 32px 64px rgba(0, 0, 0, 0.62)',
      },
      backgroundImage: {
        'glass-panel': 'linear-gradient(180deg, rgba(255, 255, 255, 0.052) 0%, rgba(255, 255, 255, 0.016) 38%, rgba(255, 255, 255, 0.012) 100%)',
        'glass-subtle': 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.012) 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
}
