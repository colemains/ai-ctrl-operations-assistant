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
        // Expedient Core Colors (exact RGB from Brand Book)
        'expedient-black': '#000000',     // RGB 0 0 0
        'expedient-white': '#FFFFFF',     // RGB 255 255 255
        'expedient-red': '#F20505',       // RGB 242 5 5 - Core Red

        // Expedient Accent Colors
        'expedient-fuchsia': '#D30567',   // RGB 211 5 103
        'expedient-orchid': '#5532CD',    // RGB 85 50 205 - Deep Orchid
        'expedient-amber': '#F48C06',     // RGB 244 140 6 - Pulse Amber
        'expedient-teal': '#2EB2B2',      // RGB 46 178 178 - Signal Teal

        // Expedient Neutral Colors
        'expedient-charcoal': '#323232',  // RGB 50 50 50
        'expedient-steel': '#646464',     // RGB 100 100 100
        'expedient-smoke': '#D2D2D2',     // RGB 210 210 210
        'expedient-cloud': '#F0F0F0',     // RGB 240 240 240
      },
      fontFamily: {
        // Expedient uses Inter (Extra Bold + Regular)
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontWeight: {
        // Expedient brand weights
        normal: '400',    // Regular
        bold: '700',      // Bold (tertiary, use sparingly)
        extrabold: '800', // Extra Bold (primary for headings/CTAs)
      },
    },
  },
  plugins: [],
}