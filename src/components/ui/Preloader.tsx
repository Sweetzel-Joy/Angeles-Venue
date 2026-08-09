'use client';

import { useLenis } from 'lenis/react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { VENUE } from '@/lib/content';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/utils';

/** Shortest time the overlay stays up, so a warm reload does not strobe it. */
const MIN_VISIBLE_MS = 700;

/**
 * Hard cap. The exit fires on this even if `load` never does.
 *
 * A preloader waiting on an asset that will never arrive is not a slow site,
 * it is an unreachable one — the content is sitting in the DOM behind an opaque
 * overlay. This is the difference between the two.
 */
const MAX_WAIT_MS = 4000;

/** Fade duration. Kept in step with the `duration-500` class below. */
const FADE_MS = 500;

/**
 * Full-screen splash shown on every page load.
 *
 * **This is rendered on the server, deliberately.** A preloader that mounts
 * after hydration paints the page first and then covers it, which is backwards
 * and looks like a bug. Being in the initial HTML means it is part of the first
 * paint. Nothing about that is observable in the hydrated DOM, so the check
 * lives against the raw HTML response in `scratchpad/verify/preloader.mjs`.
 *
 * Its background is `ivory-100` to equal the hero's, so the fade dissolves the
 * logo and type without the ground changing colour underneath.
 *
 * There is also a **CSS failsafe** in `globals.css`: if JavaScript never runs,
 * React never unmounts this and the site stays hidden behind it forever. That
 * rule fades it out at 8s with no JS involved.
 */
export function Preloader() {
  const [phase, setPhase] = useState<'visible' | 'leaving' | 'gone'>('visible');
  const prefersReducedMotion = usePrefersReducedMotion();
  // `null` under reduced motion — SmoothScrollProvider does not mount Lenis at
  // all in that case, so every call here has to be guarded.
  const lenis = useLenis();

  useEffect(() => {
    const started = performance.now();
    const timers: ReturnType<typeof setTimeout>[] = [];

    /*
      `scheduled` is deliberately a plain local, **not** a ref.

      Its only job is to stop `load` and the cap below from both scheduling the
      exit within a single effect run. A ref would do that too — and would also
      survive the cleanup that React 18 StrictMode performs between its double
      mount in development. The second run would then find the guard already
      set, schedule nothing, and the overlay would stay up forever with the CSS
      failsafe as the only thing retiring it. That is exactly what happened
      here; the timeline is in scratchpad/verify. Effect-scoped state for an
      effect-scoped concern.
    */
    let scheduled = false;

    const leave = () => {
      if (scheduled) return;
      scheduled = true;

      const remaining = Math.max(0, MIN_VISIBLE_MS - (performance.now() - started));
      timers.push(
        setTimeout(() => {
          setPhase('leaving');
          timers.push(setTimeout(() => setPhase('gone'), FADE_MS));
        }, remaining),
      );
    };

    // On a warm cache `load` can already have fired before this effect runs,
    // in which case the listener would never be called.
    if (document.readyState === 'complete') {
      leave();
    } else {
      window.addEventListener('load', leave, { once: true });
    }
    timers.push(setTimeout(leave, MAX_WAIT_MS));

    return () => {
      window.removeEventListener('load', leave);
      timers.forEach(clearTimeout);
    };
    // Runs once. `prefersReducedMotion` is deliberately not a dependency: it
    // settles from false to its real value shortly after mount, and tearing
    // the timers down mid-flight to rebuild them is the same failure again.
    // It only affects the fade, which is handled in the className below.
  }, []);

  /* Lenis owns the wheel, so `overflow: hidden` alone would not stop the page
     moving behind the overlay. Stop it while covered, start it on the way out. */
  useEffect(() => {
    if (!lenis) return;
    if (phase === 'visible') lenis.stop();
    else lenis.start();
  }, [lenis, phase]);

  if (phase === 'gone') return null;

  return (
    <div
      id="preloader"
      // Decorative: everything in here repeats the venue name, which the page's
      // own <h1> already carries, and the real content is in the DOM and
      // available to assistive tech straight away. Announcing "Loading" and
      // then falling silent would be worse.
      aria-hidden="true"
      className={cn(
        'fixed inset-0 z-[200] flex flex-col items-center justify-center gap-5 bg-ivory-100',
        !prefersReducedMotion && 'transition-opacity duration-500 ease-out',
        phase === 'leaving' && 'pointer-events-none opacity-0',
      )}
    >
      <Image
        src="/images/logo-watermark.jpg"
        alt=""
        width={2048}
        height={2048}
        priority
        // Same reasoning as the navbar: the JPEG has an opaque white ground,
        // and rounding makes its edge read as a mark rather than a rectangle.
        sizes="160px"
        className="h-36 w-36 select-none rounded-2xl"
      />

      <p className="font-display text-3xl font-light text-clay-600">{VENUE.name}</p>

      <p className="text-xs uppercase tracking-eyebrow text-ink-muted">Events Place</p>
    </div>
  );
}
