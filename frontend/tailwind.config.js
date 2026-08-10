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
        // 🎨 Ethereal Glass Theme - High-End Visual Design
        background: '#050505',    // ✅ 最深 OLED 黑（替代 #0F1117）
        surface: '#1A1D24',
        surfaceHover: '#262932',
        primary: '#FFFFFF',
        primaryHover: '#E4E4E7',
        text: '#F4F4F5',
        textSecondary: '#9CA3AF',
        border: '#27272A',
        success: '#FFFFFF',
        error: '#FFFFFF',
      },
      fontFamily: {
        // ✅ 移除 Inter，使用 Geist 优先
        'sans': ['Geist', 'Plus Jakarta Sans', 'SF Pro Display', '-apple-system', 'system-ui', 'sans-serif'],
        'mono': ['Geist Mono', 'JetBrains Mono', 'SF Mono', 'monospace'],
      },
      animation: {
        // ✅ 流体动画系统 - 800ms cubic-bezier
        'fade-in': 'premiumFadeIn 800ms cubic-bezier(0.32, 0.72, 0, 1)',
        'slide-up': 'premiumSlideUp 700ms cubic-bezier(0.32, 0.72, 0, 1)',
        'pulse-dot-1': 'pulseDot 1.4s infinite ease-in-out 0s',
        'pulse-dot-2': 'pulseDot 1.4s infinite ease-in-out 0.2s',
        'pulse-dot-3': 'pulseDot 1.4s infinite ease-in-out 0.4s',
      },
      keyframes: {
        // ✅ 重度 blur + translate 入场动画
        premiumFadeIn: {
          '0%': {
            opacity: '0',
            transform: 'translateY(16px)',
            filter: 'blur(8px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
            filter: 'blur(0)',
          },
        },
        premiumSlideUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(24px)',
            filter: 'blur(4px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
            filter: 'blur(0)',
          },
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
      // ✅ 自定义 transition timing
      transitionTimingFunction: {
        'premium': 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
      transitionDuration: {
        'premium': '700ms',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}