/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#173D2B',
          dark: '#0F291D',
          light: '#245C42',
        },
        sage: {
          DEFAULT: '#2D6547',
          light: '#3C845E',
          soft: '#EAF3ED',
        },
        lime: {
          DEFAULT: '#B7E36A',
          hover: '#A4D354',
          light: '#F2F9E5',
        },
        cta: {
          DEFAULT: '#F2A65A',
          hover: '#E59445',
          light: '#FEF6EE',
        },
        bg: {
          DEFAULT: '#F7F7F2',
          alt: '#EFEFEA',
        },
        surface: '#FFFFFF',
        text: {
          primary: '#202820',
          secondary: '#6A746B',
          muted: '#8E9A8F',
        },
        border: {
          DEFAULT: '#E3E8E2',
          strong: '#CCD4CB',
        },
        status: {
          danger: '#DC4C4C',
          dangerSoft: '#FDF2F2',
          success: '#2F9A5B',
          successSoft: '#EEF8F2',
          warning: '#E8A317',
          warningSoft: '#FEF8EA',
          info: '#2B7CB9',
          infoSoft: '#EBF4FB',
        }
      },
      fontFamily: {
        sans: ['Inter', 'DM Sans', 'Manrope', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 8px -1px rgba(23, 61, 43, 0.06), 0 1px 3px -1px rgba(23, 61, 43, 0.04)',
        elevated: '0 12px 24px -4px rgba(23, 61, 43, 0.08), 0 4px 8px -2px rgba(23, 61, 43, 0.04)',
      }
    },
  },
  plugins: [],
};
