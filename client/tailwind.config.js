/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Poppins', 'system-ui', 'sans-serif'] },
      colors: {
        brand: { DEFAULT: '#4361EE', dark: '#26359B', soft: '#E9EEFF', track: '#D9DEFA' },
        danger: { DEFAULT: '#E5484D', soft: '#FDECEC' },
      },
    },
  },
  plugins: [],
};
