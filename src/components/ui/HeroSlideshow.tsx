'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { HERO_SLIDES } from '@/lib/content';
import { cn } from '@/lib/utils';

/** How long each slide holds before the next one crossfades in. */
const INTERVAL_MS = 3000;

/**
 * Wallpaper slideshow behind the hero.
 *
 * The photographs sit at 60% opacity over the section's `ivory-100`. The
 * nesting is what makes that work: this wrapper is held at `0.6` and the active
 * slide inside it at `1`, so the crossfade happens *within* that level and the
 * visible result never exceeds 60%.
 *
 * Two structural points that are easy to undo:
 *
 *  - The image layer is `aria-hidden` and `pointer-events-none`. The chevrons
 *    are **outside** it — they are real controls, and burying them in an
 *    `aria-hidden` subtree would remove them from assistive tech entirely while
 *    still leaving them on screen.
 *  - **The pause is scoped to the chevrons, never to the section.** It briefly
 *    lived on the `<section>`, which sounds harmless and was not: the hero is
 *    `min-h-[100svh]`, so the section *is* the viewport, and a cursor resting
 *    anywhere on the page froze the carousel permanently. Measured — the slide
 *    index sat at `1` for fifteen seconds. Do not move these handlers up.
 *
 * Auto-advance runs for everyone, including under `prefers-reduced-motion`.
 * Those visitors get an instant cut rather than the crossfade, which the
 * reduced-motion backstop in `globals.css` already does by collapsing every
 * `transition-duration` — so there is no branch for it here.
 */
export function HeroSlideshow() {
  const [index, setIndex] = useState(0);
  // Held while the pointer or focus is on a chevron, so the slide cannot change
  // out from under someone reaching for it.
  const [isPaused, setIsPaused] = useState(false);

  const count = HERO_SLIDES.length;
  const go = useCallback(
    (step: number) => setIndex((current) => (current + step + count) % count),
    [count],
  );

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => go(1), INTERVAL_MS);
    return () => clearInterval(timer);
  }, [go, isPaused]);

  const pause = useCallback(() => setIsPaused(true), []);
  const resume = useCallback(() => setIsPaused(false), []);

  return (
    <div className="absolute inset-0">
      {/*
        The photographs, at 60%. Decorative, and never intercepts a click meant
        for the content sitting above it.

        This layer used to sit at 18% under an ivory scrim, which held the hero
        copy at WCAG AA. Both were removed deliberately, on request, so the
        venue reads clearly through the hero — see the note on the copy in
        Hero.tsx and the figures in the README. Turning this number down or
        putting a scrim back would undo a decision, not fix a bug.
      */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-60">
        {HERO_SLIDES.map((slide, i) => (
          <Image
            key={slide.src}
            src={slide.src}
            alt=""
            fill
            // Only the first is needed at first paint; the rest are not on
            // screen until at least 3s in.
            priority={i === 0}
            sizes="100vw"
            className={cn(
              'select-none object-cover transition-opacity duration-1000 ease-out',
              // Under reduced motion the global backstop in globals.css
              // collapses this duration, so the swap is instant rather than a
              // fade. No extra handling needed here.
              i === index ? 'opacity-100' : 'opacity-0',
            )}
          />
        ))}
      </div>

      <SlideButton
        side="left"
        onClick={() => go(-1)}
        label="Previous image"
        onHold={pause}
        onRelease={resume}
      />
      <SlideButton
        side="right"
        onClick={() => go(1)}
        label="Next image"
        onHold={pause}
        onRelease={resume}
      />
    </div>
  );
}

/**
 * A chevron.
 *
 * Visible on hover — plus on keyboard focus, plus permanently on coarse
 * pointers. Hover alone would strand both keyboard and touch users, who have no
 * way to produce a hover at all. Tailwind 3.4 has no `pointer-coarse` variant,
 * hence the arbitrary media variant.
 *
 * `onHold`/`onRelease` freeze the timer while this control is under the pointer
 * or holds focus — the narrowest scope that still stops a slide changing
 * mid-click. Deliberately not on any larger element: on the hero, "larger"
 * means the whole viewport.
 */
function SlideButton({
  side,
  onClick,
  label,
  onHold,
  onRelease,
}: {
  side: 'left' | 'right';
  onClick: () => void;
  label: string;
  onHold: () => void;
  onRelease: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      onMouseEnter={onHold}
      onMouseLeave={onRelease}
      onFocus={onHold}
      onBlur={onRelease}
      className={cn(
        'absolute top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center',
        'rounded-full border border-ink/10 bg-ivory-50/70 text-ink backdrop-blur-sm',
        'opacity-0 transition-[opacity,background-color] duration-300',
        'hover:bg-ivory-50 group-hover:opacity-100 focus-visible:opacity-100',
        '[@media(pointer:coarse)]:opacity-100',
        'motion-reduce:transition-none',
        side === 'left' ? 'left-3 sm:left-6' : 'right-3 sm:right-6',
      )}
    >
      <ChevronIcon direction={side} />
    </button>
  );
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d={direction === 'left' ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'} />
    </svg>
  );
}
