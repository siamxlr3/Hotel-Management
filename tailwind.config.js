/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './resources/**/*.{js,jsx,ts,tsx,blade.php}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body:    ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#A8D5A2',
          dark:    '#2D3A2E',
          light:   '#E8F5E0',
        },
      },
    },
  },
  plugins: [],
};
