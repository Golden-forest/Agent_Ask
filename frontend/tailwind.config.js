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
        // Premium Dark Theme Colors
        background: '#0F1117', // Deeper, richer dark blue-black
        surface: '#1E212B',    // Slightly lighter blue-grey for cards
        surfaceHover: '#2A2E3B',
        primary: '#6366F1',    // Indigo-500 for a sophisticated accent (was #0066cc)
        primaryHover: '#4F46E5',
        text: '#F3F4F6',       // Gray-100, softer than pure white
        textSecondary: '#9CA3AF', // Gray-400
        border: '#2E3344',     // Subtle border
        success: '#10B981',    // Emerald-500
        error: '#EF4444',      // Red-500
      },
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}