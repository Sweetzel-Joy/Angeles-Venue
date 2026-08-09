import dynamic from 'next/dynamic';
import { Hero } from '@/components/sections/Hero';
import { Navbar } from '@/components/ui/Navbar';

/**
 * Below-the-fold sections are code-split.
 *
 * `Hero` and `Navbar` are imported directly — they are visible immediately, so
 * splitting them would only add a round trip before first paint. Everything
 * below is loaded as its own chunk, which keeps the initial JS to the part of
 * the page the visitor can actually see.
 *
 * These keep `ssr: true` (the default), unlike the 3D scenes. They render fine
 * on the server, so their HTML is in the initial response and the content is
 * readable — and indexable — before any JavaScript executes. Only the WebGL
 * canvases genuinely cannot be server-rendered.
 */
const About = dynamic(() =>
  import('@/components/sections/About').then((mod) => mod.About),
);
const Services = dynamic(() =>
  import('@/components/sections/Services').then((mod) => mod.Services),
);
const Gallery = dynamic(() =>
  import('@/components/sections/Gallery').then((mod) => mod.Gallery),
);
const Amenities = dynamic(() =>
  import('@/components/sections/Amenities').then((mod) => mod.Amenities),
);
const Testimonials = dynamic(() =>
  import('@/components/sections/Testimonials').then((mod) => mod.Testimonials),
);
const BookingCta = dynamic(() =>
  import('@/components/sections/BookingCta').then((mod) => mod.BookingCta),
);
const Footer = dynamic(() =>
  import('@/components/sections/Footer').then((mod) => mod.Footer),
);

export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* Target of the skip link. `tabIndex={-1}` makes it focusable
          programmatically so focus actually lands here on activation — without
          it, some browsers move the viewport but leave focus at the link. */}
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <About />
        <Services />
        <Gallery />
        <Amenities />
        <Testimonials />
        <BookingCta />
      </main>

      <Footer />
    </>
  );
}
