/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: 'var(--brand-color)',
        'brand-light': 'var(--brand-light)'
      }
    },
  },
  plugins: []
};