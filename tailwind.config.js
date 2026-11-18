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
        skyBg: {
          DEFAULT: '#EAF6FF',
          soft: '#F5FAFF',
          card: '#FFFFFF',
          border: '#D1E8F8',
        },
        skyBlue: {
          DEFAULT: '#2196E8',
          hover: '#1976D2',
          light: '#E1F1FD',
          soft: '#F0F8FF',
          dark: '#123B5D',
        },
        navy: {
          DEFAULT: '#123B5D',
          dark: '#0B2338',
          light: '#1D4F78',
          muted: '#4B6F8E',
          soft: '#EAF2F8',
        },
        forest: {
          DEFAULT: '#123B5D',
          dark: '#0B2338',
          light: '#1D4F78',
        },
        sage: {
          DEFAULT: '#2196E8',
          light: '#42A5F5',
          soft: '#EAF6FF',
        },
        lime: {
          DEFAULT: '#2196E8',
          hover: '#1976D2',
          light: '#EAF6FF',
        },
        cta: {
          DEFAULT: '#2196E8',
          hover: '#1976D2',
          light: '#EAF6FF',
        },
        bg: {
          DEFAULT: '#EAF6FF',
          alt: '#F5FAFF',
        },
        surface: '#FFFFFF',
        text: {
          primary: '#123B5D',
          secondary: '#4B6F8E',
          muted: '#7697B3',
        },
        border: {
          DEFAULT: '#D1E8F8',
          strong: '#B4D7F0',
        },
        status: {
          danger: '#DC4C4C',
          dangerSoft: '#FDF2F2',
          success: '#10B981',
          successSoft: '#ECFDF5',
          warning: '#F59E0B',
          warningSoft: '#FFFBEB',
          info: '#2196E8',
          infoSoft: '#EAF6FF',
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
