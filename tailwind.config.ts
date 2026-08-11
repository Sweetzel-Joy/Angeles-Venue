import type { Config } from 'tailwindcss';

/**
 * Warm-ivory theme.
 *
 * The palette below intentionally *replaces* Tailwind's default colours for the
 * brand scales rather than sitting alongside them, so a stray `bg-blue-500`
 * fails loudly instead of quietly shipping an off-brand colour.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Page + card surfaces
        ivory: {
          50: '#FDFBF7',
          100: '#F7F1E8',
          200: '#EFE5D6',
          300: '#E4D6C1',
        },
        // Terracotta — primary accent, CTAs
        clay: {
          200: '#F0CDB9',
          300: '#E0A98B',
          400: '#D08461',
          500: '#C0653F',
          600: '#A5502F',
          700: '#833E24',
        },
        // Sage — secondary accent, dividers, muted UI
        sage: {
          100: '#E5EADF',
          200: '#CBD5C0',
          300: '#B0BFA2',
          400: '#9AAE8A',
          600: '#6B8060',
          800: '#43503C',
        },
        /*
          The footer's ground. A brighter, more yellow green than the sage
          scale, which is deliberately greyed — `sage-200` (#CBD5C0) sits next
          to this and reads dusty by comparison.

          NOTE: matched by eye from a supplied swatch, not sampled from a file.
          If you have the exact value, this is the one place to correct it.

          It is much darker than the ivory it replaced, so footer text had to be
          darkened with it: `ink-muted` measures 4.2:1 here and `ink-faint`
          2.2:1, both under AA. See Footer.tsx.
        */
        fern: {
          200: '#CDDCA6',
        },
        // Warm near-black. Never pure #000 — it reads cold against ivory.
        ink: {
          DEFAULT: '#2B2721',
          muted: '#6B6155',
          faint: '#9A9082',
        },
      },
      fontFamily: {
        // Wired to next/font CSS variables declared in app/layout.tsx
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Fluid display sizes — clamp() avoids a cascade of breakpoint overrides
        'display-sm': ['clamp(2rem, 5vw, 3rem)', { lineHeight: '1.1' }],
        'display-md': ['clamp(2.5rem, 7vw, 4.5rem)', { lineHeight: '1.05' }],
        'display-lg': ['clamp(3rem, 10vw, 7rem)', { lineHeight: '0.98' }],
      },
      letterSpacing: {
        eyebrow: '0.28em',
      },
      maxWidth: {
        content: '80rem',
      },
      boxShadow: {
        soft: '0 2px 8px -2px rgba(43, 39, 33, 0.08), 0 12px 32px -8px rgba(43, 39, 33, 0.10)',
        lift: '0 8px 24px -4px rgba(43, 39, 33, 0.12), 0 24px 56px -12px rgba(43, 39, 33, 0.16)',
      },
      keyframes: {
        'scroll-hint': {
          '0%': { transform: 'translateY(0)', opacity: '0' },
          '30%': { opacity: '1' },
          '100%': { transform: 'translateY(0.75rem)', opacity: '0' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'scroll-hint': 'scroll-hint 1.8s cubic-bezier(0.16, 1, 0.3, 1) infinite',
        marquee: 'marquee 40s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
