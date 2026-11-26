/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: { 950: 'var(--cm-ink-950)', 900: 'var(--cm-ink-900)', 700: 'var(--cm-ink-700)' },
        paper: { 50: 'var(--cm-paper-50)', 100: 'var(--cm-paper-100)', 200: 'var(--cm-paper-200)', 300: 'var(--cm-paper-300)' },
        text: { primary: 'var(--cm-text-primary)', muted: 'var(--cm-text-muted)', onink: 'var(--cm-text-on-ink)', mutedOnInk: 'var(--cm-muted-on-ink)' },
        brass: { 200: 'var(--cm-brass-200)', 500: 'var(--cm-brass-500)', 600: 'var(--cm-brass-600)' },
        sapphire: { 100: 'var(--cm-sapphire-100)', 600: 'var(--cm-sapphire-600)', 700: 'var(--cm-sapphire-700)' },
        amethyst: { 100: 'var(--cm-amethyst-100)', 600: 'var(--cm-amethyst-600)' },
        emerald: { 100: 'var(--cm-emerald-100)', 500: 'var(--cm-emerald-500)', 700: 'var(--cm-emerald-700)' },
        topaz: { 100: 'var(--cm-topaz-100)', 500: 'var(--cm-topaz-500)', 700: 'var(--cm-topaz-700)' },
        ruby: { 100: 'var(--cm-ruby-100)', 500: 'var(--cm-ruby-500)', 700: 'var(--cm-ruby-700)' },
      },
      fontFamily: { display: ['Fraunces Variable', 'serif'], sans: ['Instrument Sans Variable', 'sans-serif'], mono: ['DM Mono', 'monospace'] },
    },
  },
  plugins: [],
};
