'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LeafDecor } from '@/components/ui/LeafDecor';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { carouselSlide } from '@/lib/animations';
import { TESTIMONIALS } from '@/lib/content';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/utils';
import type { Testimonial } from '@/types';

const ADVANCE_INTERVAL = 7000;

/** Quote, author and context. Shared so the animated and reduced-motion
 *  branches below cannot drift apart. */
function TestimonialBody({ testimonial }: { testimonial: Testimonial }) {
  return (
    <>
      <QuoteMark />
      <blockquote className="font-display text-2xl font-light leading-snug text-ink md:text-3xl">
        {testimonial.quote}
      </blockquote>
      <figcaption className="flex flex-col gap-1">
        <span className="text-sm font-medium text-ink">{testimonial.author}</span>
        <span className="text-xs uppercase tracking-wider text-ink-faint">
          {testimonial.context}
        </span>
      </figcaption>
    </>
  );
}

/**
 * Auto-advancing testimonial carousel.
 *
 * The auto-advance is the accessibility-sensitive part. A carousel that keeps
 * moving while you are reading is hostile, so it pauses on:
 *
 *  - hover (pointer users) — scoped to the quote block, not the section: if the
 *    pointer is on the quote you are reading it, and pausing is right. Do not
 *    widen this to the `<section>`; on a full-height section that pauses
 *    permanently, which is exactly how the hero slideshow got stuck.
 *  - **focus within** (keyboard users — easy to forget, and without it the slide
 *    can change out from under someone who has just tabbed to a control)
 *  - tab hidden (no point animating in a background tab)
 *
 * It **does** auto-advance under `prefers-reduced-motion`, by decision — the
 * quote swaps with no travel and no animation at all (see the render below).
 * It previously froze on the first quote for those visitors, which meant the
 * other testimonials were simply never seen. Same call as the hero slideshow.
 *
 * The slide region is an `aria-live="polite"` container so screen-reader users
 * are told when the quote changes, rather than silently reading stale content.
 */
export function Testimonials() {
  const [[index, direction], setState] = useState<[number, number]>([0, 0]);
  const [isPaused, setIsPaused] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = TESTIMONIALS.length;

  const paginate = useCallback(
    (nextDirection: number) => {
      setState(([current]) => [
        (current + nextDirection + total) % total,
        nextDirection,
      ]);
    },
    [total],
  );

  const goTo = useCallback((target: number) => {
    setState(([current]) => [target, target > current ? 1 : -1]);
  }, []);

  useEffect(() => {
    if (isPaused || total <= 1) return;

    const tick = () => {
      // `document.hidden` guards against a backgrounded tab queuing up dozens
      // of transitions that all resolve at once when the tab is restored.
      if (!document.hidden) paginate(1);
    };

    timerRef.current = setInterval(tick, ADVANCE_INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paginate, isPaused, total]);

  const active = TESTIMONIALS[index];
  if (!active) return null;

  return (
    <section
      id="stories"
      aria-labelledby="stories-heading"
      // `overflow-hidden` for the botanicals: globals.css clips `section` on
      // the x-axis only, so bottom-bleeding leaves would spill downward.
      className="relative overflow-hidden bg-ivory-100 py-24 md:py-36"
    >
      <LeafDecor variant="stories" />

      {/* `relative z-10` keeps the quote and its controls above the decor. */}
      <div className="container-page relative z-10 flex flex-col gap-14">
        <SectionHeading
          id="stories-heading"
          eyebrow="In their words"
          title="What people say afterwards"
          align="center"
          className="mx-auto"
        />

        <div
          className="relative mx-auto w-full max-w-3xl"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          // Keyboard equivalent of the hover pause.
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
        >
          <div
            aria-live="polite"
            aria-atomic="true"
            className="relative min-h-[19rem] sm:min-h-[16rem]"
          >
            {/*
              Under reduced motion the slide is rendered WITHOUT
              `AnimatePresence`, not merely with gentler variants.

              `AnimatePresence` only unmounts the outgoing node once its exit
              animation reports completion. With reduced motion that completion
              never arrives: in `mode="wait"` the carousel froze at
              `opacity: 0` while the pagination dots kept advancing behind it,
              and in `mode="sync"` the stale figures piled up instead — one,
              then two, then three, all invisible. Both measured. Swapping the
              node outright has no exit animation to wait on, so it cannot
              deadlock. The quote still changes; only the movement is gone.
            */}
            {prefersReducedMotion ? (
              <figure
                key={active.id}
                className="absolute inset-0 flex flex-col items-center gap-6 text-center"
              >
                <TestimonialBody testimonial={active} />
              </figure>
            ) : (
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.figure
                  key={active.id}
                  custom={direction}
                  variants={carouselSlide}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  // Drag to swipe. `dragElastic` gives the rubber-band feel; the
                  // 80px offset threshold stops a stray tap from paginating.
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.18}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -80) paginate(1);
                    else if (info.offset.x > 80) paginate(-1);
                  }}
                  className="absolute inset-0 flex cursor-grab flex-col items-center gap-6 text-center active:cursor-grabbing will-animate"
                >
                  <TestimonialBody testimonial={active} />
                </motion.figure>
              </AnimatePresence>
            )}
          </div>

          {/* Controls */}
          <div className="mt-8 flex items-center justify-center gap-6">
            <CarouselButton label="Previous testimonial" onClick={() => paginate(-1)}>
              ←
            </CarouselButton>

            <ul className="flex items-center gap-2.5">
              {TESTIMONIALS.map((testimonial, dotIndex) => (
                <li key={testimonial.id}>
                  <button
                    type="button"
                    onClick={() => goTo(dotIndex)}
                    aria-label={`Show testimonial ${dotIndex + 1} of ${total}`}
                    aria-current={dotIndex === index ? 'true' : undefined}
                    className={cn(
                      'block h-2 rounded-full transition-all duration-400 ease-out motion-reduce:transition-none',
                      dotIndex === index
                        ? 'w-7 bg-clay-500'
                        : 'w-2 bg-ink/20 hover:bg-ink/40',
                    )}
                  />
                </li>
              ))}
            </ul>

            <CarouselButton label="Next testimonial" onClick={() => paginate(1)}>
              →
            </CarouselButton>
          </div>
        </div>
      </div>
    </section>
  );
}

function CarouselButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 text-lg text-ink-muted transition-colors duration-200 hover:border-clay-500/50 hover:text-clay-600"
    >
      <span aria-hidden="true">{children}</span>
    </button>
  );
}

function QuoteMark() {
  return (
    <span
      aria-hidden="true"
      className="font-display text-6xl leading-none text-clay-300"
    >
      &ldquo;
    </span>
  );
}
