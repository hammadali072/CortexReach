import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        idGrotesk: 'ID Grotesk',
      },
      colors: {
        primary: '#363b6c',
        'primary-hover': '#2e3260',
        'purple-tint': '#a8a3e3',
        'gray-tint': '#c6c9e7',
        'white-tint': '#eaedfe',
        dark: '#1a1d3a',
        muted: '#6b7280',
        subtle: '#9ca3af',
        surface: '#ffffff',
        background: '#f5f6fc',
        border: '#e2e5f5',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #a8a3e3 0%, #363b6c 100%)',
      },
      boxShadow: {
        'primary': '0 1px 3px 0 rgba(54, 59, 108, 0.2)',
      },
    },
  },
  plugins: [
    typography,
    function ({ addBase }) {
      addBase({
        html: {
          padding: "0",
          margin: "0",
        },
        body: {
          padding: "0",
          margin: "0",
          fontFamily: "ID Grotesk",
          "background-color": "#f5f6fc",
        },
        '*': {
          padding: "0",
          margin: "0",
          boxSizing: "border-box",
        },
        ul: {
          listStyle: "none",
          margin: "0",
          padding: "0",
        },
        li: {
          listStyle: "none",
          margin: "0",
          padding: "0",
        },
        a: {
          display: "inline-block",
          textDecoration: "none",
          transition: "0.3s linear",
          '&:hover': {
            textDecoration: "none",
          },
        },
        p: {
          margin: "0",
          padding: "0",
        },
        h1: {
          margin: "0",
          padding: "0",
        },
        h2: {
          margin: "0",
          padding: "0",
        },
        h3: {
          margin: "0",
          padding: "0",
        },
        h4: {
          margin: "0",
          padding: "0",
        },
        h5: {
          margin: "0",
          padding: "0",
        },
        h6: {
          margin: "0",
          padding: "0",
        },
        img: {
          maxWidth: '100%',
          height: 'auto',
        },
        '.container': {
          width: '1320px !important',
          'max-width': '100%',
          margin: '0 auto',
          padding: '0 15px !important',
          "@media (max-width: 1200px)": {
            maxWidth: '100% !important',
            padding: '0 12px !important',
          },
        },
        '.container-fluid': {
          width: 'calc(100% - 100px)',
          margin: 'auto',
          "@media (max-width: 1400px)": {
            width: '100%',
            padding: '0 16px',
          },
        },
      });
    },
  ],
}