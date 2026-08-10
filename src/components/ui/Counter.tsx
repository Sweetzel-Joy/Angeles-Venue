'use client';

import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { useEffect } from 'react';

/** How long a number takes to travel from 0 to its value. */
const DURATION_S = 1.6;

/**
 * Splits `"20+"` into `{ target: 20, suffix: "+" }`.
 *
 * Returns `null` for anything that does not start with digits, so a future
 * stat like "Many" renders verbatim instead of animating to `NaN`.
 */
function parseValue(value: string): { target: number; suffix: string } | null {
  const match = /^(\d+)(.*)$/.exec(value.trim());
  if (!match?.[1]) return null;
  return { target: Number(match[1]), suffix: match[2] ?? '' };
}

interface CounterProps {
  /** The finished value, e.g. `"100"` or `"20+"`. */
  value: string;
  /** Counting starts when this turns true — driven by one observer upstream. */
  start: boolean;
  className?: string;
}

/**
 * A number that counts up to its value once, when told to.
 *
 * Four things here are deliberate:
 *
 *  - **It counts under `prefers-reduced-motion` too**, by decision. It used to
 *    render the finished number instantly for those visitors, which meant the
 *    effect was simply never seen on a machine with that setting on. What moves
 *    here is the text content of a number, in place — no travel, no scaling, no
 *    parallax. That is not the kind of movement the preference exists to
 *    suppress, and it is why the parallax in `About.tsx` stays gated while this
 *    does not.
 *  - **The motion value is rendered as a child of `motion.span`.** Framer
 *    updates that text node directly, so the count does not re-render this
 *    component — let alone the whole About section — sixty times a second.
 *  - **The animating digits are `aria-hidden`, with the value repeated in an
 *    `sr-only` span.** Otherwise a screen reader either announces a stream of
 *    intermediate numbers or, worse, reads a half-finished one as the answer.
 *  - **The suffix is kept out of the animation.** `"20+"` counts to 20 and
 *    keeps its `+`; parsing it as a bare integer would silently drop it.
 *
 * Note that the `globals.css` reduced-motion backstop cannot reach this: it
 * collapses CSS transition and animation durations, and this is a motion value
 * driven from rAF straight into a text node. No `.motion-always` needed.
 */
export function Counter({ value, start, className }: CounterProps) {
  const parsed = parseValue(value);

  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    if (!parsed || !start) return;

    const controls = animate(count, parsed.target, {
      duration: DURATION_S,
      // Decelerating, so it settles on the number rather than snapping.
      ease: [0.16, 1, 0.3, 1],
    });
    return () => controls.stop();
  }, [count, parsed, start]);

  // A value that does not start with digits ("Many") is rendered verbatim —
  // animating it would count to NaN.
  if (!parsed) {
    return <span className={className}>{value}</span>;
  }

  return (
    <span className={className}>
      <span aria-hidden="true">
        <motion.span>{rounded}</motion.span>
        {parsed.suffix}
      </span>
      <span className="sr-only">{value}</span>
    </span>
  );
}
