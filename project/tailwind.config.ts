import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        arimo: ['Arimo', 'sans-serif'],
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        border: '#DDDDDD',
        'text-primary': '#000000',
        'text-secondary': '#666666',
        'text-tertiary': '#999999',
        'bg-secondary': '#F5F5F5',
      },
      lineHeight: {
        '14': '14px',
        '24': '24px',
      },
      fontSize: {
        '12': '12px',
        '14': '14px',
        '28': '28px',
      }
    },
  },
  plugins: [],
}

export default config