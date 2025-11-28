/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#e6f3ff',
          100: '#cce4ff',
          200: '#99c9ff',
          300: '#66aeff',
          400: '#338dff',
          500: '#0f72f0',
          600: '#0c59c0',
          700: '#0a4696',
          800: '#093b7a',
          900: '#0b1224'
        }
      }
    }
  },
  plugins: []
};
