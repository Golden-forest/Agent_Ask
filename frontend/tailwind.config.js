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
        // Monochrome Dark Theme
        background: '#0F1117',
        surface: '#1A1D24',
        surfaceHover: '#262932',
        primary: '#FFFFFF',       // Pure white as primary accent
        primaryHover: '#E4E4E7',  // Light gray for hover
        text: '#F4F4F5',
        textSecondary: '#9CA3AF',
        border: '#27272A',
        success: '#FFFFFF',       // Mono: use icons, not colors
        error: '#FFFFFF',
      },
      fontFamily: {
        'sans': ['SF Pro Rounded', 'SF Pro Display', '-apple-system', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-dot-1': 'pulseDot 1.4s infinite ease-in-out 0s',
        'pulse-dot-2': 'pulseDot 1.4s infinite ease-in-out 0.2s',
        'pulse-dot-3': 'pulseDot 1.4s infinite ease-in-out 0.4s',
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
        pulseDot: {
          '0%, 80%, 100%': {
            opacity: '0.3',
            transform: 'scale(1)'
          },
          '40%': {
            opacity: '1',
            transform: 'scale(1.2)'
          }
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}