'use client';

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LinkButton } from './Button';
import { drawerSlide } from '@/lib/animations';
import { NAV_LINKS, VENUE } from '@/lib/content';
import { cn } from '@/lib/utils';

/** Scroll distance, in px, before the bar switches to its solid state. */
const SOLID_AFTER = 80;

/**
 * Sticky navigation.
 *
 * Transparent over the hero, solid past `SOLID_AFTER`. The scroll state is read
 * through `useMotionValueEvent` rather than a React `onScroll` handler, so the
 * common case — scrolling without crossing the threshold — does no React work
 * at all. Only the crossing itself triggers a render.
 */
export function Navbar() {
  const [isSolid, setIsSolid] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { scrollY } = useScroll();

  const drawerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const shouldBeSolid = latest > SOLID_AFTER;
    // Guarded so we only re-render on an actual state change.
    setIsSolid((current) => (current === shouldBeSolid ? current : shouldBeSolid));
  });

  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

  /* Drawer: escape to close, focus trap, focus restoration ----------------- */
  useEffect(() => {
    if (!isDrawerOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeDrawer();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusables = drawerRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (!focusables || focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    // Captured now rather than read in the cleanup. The toggle button is not
    // conditionally rendered so the two are equivalent here, but reading a ref
    // during cleanup is the pattern that breaks the moment the node becomes
    // conditional — and it is what react-hooks/exhaustive-deps warns about.
    const toggleButton = toggleRef.current;

    // Move focus into the drawer, and lock the page behind it.
    const raf = requestAnimationFrame(() => {
      drawerRef.current?.querySelector<HTMLElement>('a[href]')?.focus();
    });
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      cancelAnimationFrame(raf);
      document.body.style.overflow = previousOverflow;
      // Hand focus back to the button that opened it, so keyboard users are not
      // dropped at the top of the document.
      toggleButton?.focus();
    };
  }, [isDrawerOpen, closeDrawer]);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter,box-shadow] duration-500',
          isSolid
            ? 'border-b border-ink/10 bg-ivory-50/85 shadow-soft backdrop-blur-lg'
            : 'border-b border-transparent bg-transparent',
        )}
      >
        {/*
          Soft dark band behind the bar while it floats over the hero
          photographs, so the white nav type has a consistent ground instead of
          whatever the slide happens to be showing.

          Three things about the shape of this:

           - It is a **child**, not a background on the header. `background-image`
             is not animatable, so a gradient on the header itself would snap on
             and off as the bar changes state; opacity on a child cross-fades.
           - `h-24` against a 72px bar, so the fade finishes *below* the bar and
             there is no hard edge where the band stops.
           - `opacity-0` once solid — the scrolled bar is already ivory and must
             not be darkened.
        */}
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ink/50 to-transparent',
            'transition-opacity duration-500',
            isSolid ? 'opacity-0' : 'opacity-100',
          )}
        />

        <nav
          aria-label="Primary"
          // `relative` so the links paint above the band. Positioned elements
          // paint over non-positioned siblings, so without this the scrim would
          // cover the very type it exists to help.
          className="container-page relative flex h-[4.5rem] items-center justify-between gap-6"
        >
          {/*
            Brand mark and wordmark share a single anchor: one tab stop, one
            accessible name, one focus ring around both.

            `alt=""` is deliberate. The logo has "Angeles Venue" drawn inside it
            and the span beside it says the same words — giving the image alt
            text as well would make a screen reader announce the venue name
            twice for one link. The text carries the name; the image is
            decorative.

            This file is a **fully opaque JPEG** (alpha 255 throughout), so its
            square edge is visible against the ivory bar. `rounded-lg` makes
            that edge read as a deliberate mark rather than an untrimmed
            rectangle.

            The ground is not uniformly white, despite what this note used to
            say: sampled at 2048px it is #FFFFFF down the left and right edges
            but green foliage across the top (rgb 83,146,32) and bottom
            (rgb 193,219,57). So `mix-blend-multiply` would not cleanly drop the
            background even where it is usable — and it is not usable here
            anyway, because the bar gains `backdrop-blur-lg` once scrolled,
            which creates a stacking context and isolates the blend. (The hero's
            monogram needs none of this — it has a real alpha channel.)
          */}
          <a
            href="#hero"
            className="group flex items-center gap-2.5 rounded-lg"
          >
            <Image
              src="/images/logo-watermark.jpg"
              alt=""
              width={2048}
              height={2048}
              priority
              // Square source in a square box, so nothing is cropped — the
              // leaves, lettering and grass all survive. `sizes` keeps
              // next/image from shipping the 230 KB original for a 36px mark.
              sizes="40px"
              className="h-9 w-9 shrink-0 select-none rounded-lg"
            />
            <span
              className={cn(
                'font-display text-xl font-medium tracking-tight transition-colors',
                isSolid
                  ? 'text-ink group-hover:text-clay-600'
                  : 'text-on-photo text-white group-hover:text-clay-200',
              )}
            >
              {VENUE.name}
            </span>
          </a>

          <ul className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                {/*
                  White over the hero photographs, dark once the bar turns solid
                  ivory. The state matters: white links on the scrolled bar's
                  `bg-ivory-50/85` would be effectively invisible, so this cannot
                  be a single static colour.
                */}
                <a
                  href={link.href}
                  className={cn(
                    // `uppercase` via CSS, not uppercased strings in
                    // NAV_LINKS — the content file stays presentation-free and
                    // the footer reuses the same labels. `tracking-wide`
                    // because all-caps sets tight without a little letter
                    // spacing; the `.eyebrow` class does the same thing.
                    'group relative py-1 text-sm uppercase tracking-wide transition-colors duration-200',
                    isSolid
                      ? 'text-ink-muted hover:text-ink'
                      : 'text-on-photo text-white hover:text-clay-200',
                  )}
                >
                  {link.label}
                  {/* Underline grows from the left on hover/focus. A scaled
                      pseudo-element, so no layout is touched. */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-clay-500 transition-transform duration-300 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100 motion-reduce:transition-none"
                  />
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <LinkButton href="#booking" size="sm" className="hidden sm:inline-flex">
              Book Your Event
            </LinkButton>

            <button
              ref={toggleRef}
              type="button"
              onClick={() => setIsDrawerOpen((open) => !open)}
              aria-expanded={isDrawerOpen}
              aria-controls="mobile-nav"
              aria-label={isDrawerOpen ? 'Close menu' : 'Open menu'}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full border transition-colors md:hidden',
                isSolid
                  ? 'border-ink/15 text-ink hover:border-ink/35'
                  : 'border-white/50 text-white hover:border-white/80',
              )}
            >
              <MenuIcon open={isDrawerOpen} />
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              tabIndex={-1}
              onClick={closeDrawer}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-ink/35 backdrop-blur-sm md:hidden"
            />

            <motion.div
              ref={drawerRef}
              id="mobile-nav"
              role="dialog"
              aria-modal="true"
              aria-label="Site menu"
              variants={drawerSlide}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-y-0 right-0 z-[70] flex w-[min(20rem,85vw)] flex-col gap-2 border-l border-ink/10 bg-ivory-50 px-7 py-8 shadow-lift md:hidden"
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="font-display text-lg text-ink">Menu</span>
                <button
                  type="button"
                  onClick={closeDrawer}
                  aria-label="Close menu"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 text-ink"
                >
                  <MenuIcon open />
                </button>
              </div>

              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={closeDrawer}
                  className="border-b border-ink/8 py-4 font-display text-2xl uppercase tracking-wide text-ink transition-colors hover:text-clay-600"
                >
                  {link.label}
                </a>
              ))}

              <LinkButton href="#booking" onClick={closeDrawer} className="mt-6 w-full">
                Book Your Event
              </LinkButton>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/** Hamburger that morphs into a close icon. Pure transform, no layout. */
function MenuIcon({ open }: { open: boolean }) {
  const barBase =
    'absolute h-px w-5 bg-current transition-transform duration-300 ease-out motion-reduce:transition-none';

  return (
    <span aria-hidden="true" className="relative flex h-5 w-5 items-center justify-center">
      <span
        className={cn(barBase, open ? 'rotate-45' : '-translate-y-1.5')}
      />
      <span
        className={cn(
          'absolute h-px w-5 bg-current transition-opacity duration-200',
          open && 'opacity-0',
        )}
      />
      <span
        className={cn(barBase, open ? '-rotate-45' : 'translate-y-1.5')}
      />
    </span>
  );
}
