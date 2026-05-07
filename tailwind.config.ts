import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        '2xl': '1280px',
      },
    },
    extend: {
      colors: {
        // Animalume Brand Palette
        bg: {
          DEFAULT: '#FAF9F6', // オフホワイト基調
          subtle: '#F4F2EC',
          muted: '#EDEAE3',
        },
        ink: {
          DEFAULT: '#2A2724', // チャコール
          soft: '#5C5852',
          mute: '#9C988F',
        },
        accent: {
          rose: '#D9A5A0',    // くすみピンク
          sage: '#A8B5A0',    // セージグリーン
          gold: '#C9A76A',    // ミューテッドゴールド
          mist: '#A6B4C2',    // くすみブルー
        },
        border: {
          DEFAULT: '#E8E4DC',
          strong: '#D4CEC2',
        },
        // shadcn/ui互換の最低限
        background: '#FAF9F6',
        foreground: '#2A2724',
        primary: {
          DEFAULT: '#2A2724',
          foreground: '#FAF9F6',
        },
        secondary: {
          DEFAULT: '#EDEAE3',
          foreground: '#2A2724',
        },
        muted: {
          DEFAULT: '#F4F2EC',
          foreground: '#5C5852',
        },
        destructive: {
          DEFAULT: '#B85450',
          foreground: '#FAF9F6',
        },
        ring: '#9C988F',
      },
      fontFamily: {
        sans: [
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'sans-serif',
        ],
        serif: [
          '"Noto Serif JP"',
          'serif',
        ],
      },
      fontSize: {
        // 日韓混在を想定した余裕めの行高
        'display': ['2.5rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'h1': ['2rem', { lineHeight: '1.4', letterSpacing: '-0.005em' }],
        'h2': ['1.5rem', { lineHeight: '1.5' }],
      },
      borderRadius: {
        'sm': '0.25rem',
        DEFAULT: '0.5rem',
        'md': '0.75rem',
        'lg': '1rem',
        'xl': '1.5rem',
        '2xl': '2rem',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
      },
    },
  },
  plugins: [animate],
} satisfies Config;
