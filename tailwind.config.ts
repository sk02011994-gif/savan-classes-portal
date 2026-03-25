import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#fbbf24',
        'primary-dark': '#f59e0b',
        surface: '#1e293b',
        background: '#0f172a',
        'surface-2': '#334155',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        gold: '0 0 30px rgba(251,191,36,0.15)',
        'gold-sm': '0 0 15px rgba(251,191,36,0.1)',
      },
    },
  },
  plugins: [],
}
export default config
