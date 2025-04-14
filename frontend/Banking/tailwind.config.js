/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./screens/**/*.{js, jsx, ts, tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./navigation/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E40AF', // Bleu primaire
          light: '#3B82F6',
          dark: '#1E3A8A',
        },
        secondary: {
          DEFAULT: '#0F172A', // Couleur secondaire
          light: '#1E293B',
          dark: '#0F172A',
        },
        success: {
          DEFAULT: '#10B981', // Vert pour les transactions positives
          light: '#34D399',
          dark: '#059669',
        },
        danger: {
          DEFAULT: '#EF4444', // Rouge pour les transactions négatives
          light: '#F87171',
          dark: '#DC2626',
        },
        warning: {
          DEFAULT: '#F59E0B', // Orange pour les avertissements
          light: '#FBBF24',
          dark: '#D97706',
        },
        info: {
          DEFAULT: '#6366F1', // Indigo pour les informations
          light: '#818CF8',
          dark: '#4F46E5',
        },
      },
      fontFamily: {
        sans: ['System', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

