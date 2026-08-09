import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Dancing_Script, Inter } from 'next/font/google';
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider';
import { VENUE } from '@/lib/content';
import './globals.css';

/**
 * Fonts are loaded through `next/font`, which self-hosts them at build time.
 * No runtime request to fonts.googleapis.com, no FOUT, and no third-party
 * connection for visitors.
 */
const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

/**
 * Script face, used *only* for the venue name in the hero.
 *
 * Deliberately not wired into `font-display`: that drives every heading, the
 * testimonial quotes and the amenity counter numerals, and script numerals and
 * long headings are hard to read. This is a brand accent, not a heading face.
 *
 * Only weight 700 is loaded — the design calls for the bold cut, and shipping
 * unused weights is dead payload.
 */
const script = Dancing_Script({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-script',
  display: 'swap',
});

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  // TODO: `siteUrl` in src/lib/content.ts must be the real deployed URL for
  // Open Graph images and canonical links to resolve correctly.
  metadataBase: new URL(VENUE.siteUrl),
  title: {
    default: `${VENUE.name} — ${VENUE.tagline}`,
    template: `%s · ${VENUE.name}`,
  },
  description: VENUE.intro,
  openGraph: {
    type: 'website',
    locale: 'en_PH',
    url: VENUE.siteUrl,
    siteName: VENUE.name,
    title: `${VENUE.name} — ${VENUE.tagline}`,
    description: VENUE.intro,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${VENUE.name} — ${VENUE.tagline}`,
    description: VENUE.intro,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#FDFBF7',
  width: 'device-width',
  initialScale: 1,
};

/**
 * Schema.org markup so search engines and maps surface the venue correctly.
 * Values come from the same content file as the visible page, so there is no
 * second place to keep in sync.
 */
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'EventVenue',
  name: VENUE.name,
  description: VENUE.intro,
  url: VENUE.siteUrl,
  telephone: VENUE.phone,
  email: VENUE.email,
  address: {
    '@type': 'PostalAddress',
    streetAddress: VENUE.address.street,
    addressLocality: VENUE.address.city,
    addressRegion: VENUE.address.region,
    postalCode: VENUE.address.postalCode,
    addressCountry: VENUE.address.country,
  },
  sameAs: VENUE.socials.map((social) => social.href),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${script.variable} ${sans.variable}`}
    >
      <body>
        {/* First focusable element on the page. Visually hidden until focused,
            then it must be visible — a skip link you cannot see is useless. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:font-medium focus:text-ivory-50"
        >
          Skip to main content
        </a>

        <SmoothScrollProvider>{children}</SmoothScrollProvider>

        <script
          type="application/ld+json"
          // Content is our own, from a typed constant — not user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}
