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
        // DigiWork Brand Tokens
        primary: {
          DEFAULT: '#0B1F3A',
          dark: '#071324',
          light: '#1E3A8A',
        },
        secondary: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          light: '#DBEAFE',
          soft: '#EFF6FF',
        },
        accent: {
          DEFAULT: '#38BDF8',
          hover: '#0EA5E9',
          light: '#E0F2FE',
        },
        skyBg: {
          DEFAULT: '#F5F8FC',
          soft: '#F8FAFD',
          card: '#FFFFFF',
          border: '#D7E3F1',
        },
        skyBlue: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          light: '#DBEAFE',
          soft: '#EFF6FF',
          dark: '#0B1F3A',
          accent: '#38BDF8',
        },
        navy: {
          DEFAULT: '#0B1F3A',
          dark: '#071324',
          light: '#1E3A8A',
          muted: '#4B6F8E',
          soft: '#EDF4FC',
        },
        forest: {
          DEFAULT: '#0B1F3A',
          dark: '#071324',
          light: '#1E3A8A',
        },
        sage: {
          DEFAULT: '#2563EB',
          light: '#38BDF8',
          soft: '#F5F8FC',
        },
        lime: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          light: '#F5F8FC',
        },
        cta: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          light: '#F5F8FC',
        },
        bg: {
          DEFAULT: '#F5F8FC',
          alt: '#EDF4FC',
        },
        surface: '#FFFFFF',
        text: {
          primary: '#0B1F3A',
          secondary: '#4B6F8E',
          muted: '#7697B3',
        },
        border: {
          DEFAULT: '#D7E3F1',
          strong: '#B6CEE8',
        },
        status: {
          danger: '#DC4C4C',
          dangerSoft: '#FDF2F2',
          success: '#10B981',
          successSoft: '#ECFDF5',
          warning: '#F59E0B',
          warningSoft: '#FFFBEB',
          info: '#2563EB',
          infoSoft: '#EFF6FF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'DM Sans', 'Manrope', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 8px -1px rgba(11, 31, 58, 0.06), 0 1px 3px -1px rgba(11, 31, 58, 0.04)',
        elevated: '0 12px 24px -4px rgba(11, 31, 58, 0.08), 0 4px 8px -2px rgba(11, 31, 58, 0.04)',
      }
    },
  },
  plugins: [],
};
