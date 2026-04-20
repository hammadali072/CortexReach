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
        'primary-hover': '#23274a',
        'purple-tint': '#a8a3e3',
        'gray-tint': '#c6c9e7',
        'white-tint': '#eaedfe',
        accent: '#6366f1',
        dark: '#1a1d3a',
        muted: '#6b7280',
        subtle: '#9ca3af',
        surface: '#ffffff',
        'surface-alt': '#f8fafc',
        background: '#f5f6fc',
        border: '#e2e5f5',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #363b6c 0%, #a8a3e3 100%)',
        'gradient-soft': 'linear-gradient(135deg, #eaedfe 0%, #ffffff 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)',
      },
      boxShadow: {
        'brand': '0 10px 15px -3px rgba(54, 59, 108, 0.1), 0 4px 6px -2px rgba(54, 59, 108, 0.05)',
        'premium': '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
        'button': '0 10px 20px -5px rgba(54, 59, 108, 0.2), 0 4px 6px -2px rgba(54, 59, 108, 0.1)',
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