/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Modern Light Green Palette (Fresh Mint, Vivid Sage & Clean Emerald)
        brand: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80', // Luminous Light Green
          500: '#22C55E', // Fresh Primary Light Green
          600: '#16A34A', // Vibrant Emerald for high-contrast interactive buttons
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
          950: '#052E16',
        },
        // Crisp Mint & Sage Neutrals (replaces muddy beige limestone)
        limestone: {
          50: '#F7FCF8',
          100: '#EFF8F1',
          200: '#DFEFE2',
          300: '#C7E4CE',
          400: '#A1D1AC',
          500: '#75B684',
          600: '#529762',
          700: '#40784D',
          800: '#355F3E',
          900: '#2D4E34',
          950: '#132A19',
        },
        surface: {
          light: '#F8FCF8',
          dark: '#0E1611',
          cardDark: '#142017',
          mutedDark: '#1E2E21',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
