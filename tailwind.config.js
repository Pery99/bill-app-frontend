/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E3A8A',
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#1E3A8A',
          600: '#1C3879',
          700: '#1A3468',
          800: '#183057',
          900: '#162C46'
        },
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F9FAFB'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      fontSize: {
        'heading-1': ['2.25rem', { lineHeight: '2.5rem', fontWeight: '700' }],
        'heading-2': ['1.875rem', { lineHeight: '2.25rem', fontWeight: '700' }],
        'heading-3': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],
        'body-large': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],
        'body-small': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],
      }
    },
  },
  plugins: [],
};
