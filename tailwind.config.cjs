/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: '#111827',
        muted: '#667085',
        surface: '#ffffff',
        canvas: '#f5f6fa',
        accent: '#6d5dfc',
      },
      boxShadow: {
        card: '0 8px 30px rgba(27, 35, 67, 0.06)',
      },
    },
  },
  plugins: [],
}
