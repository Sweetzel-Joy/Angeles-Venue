'use client';

import { useEffect, useRef, useState } from 'react';

interface UseCountUpOptions {
  /** The number to count to. */
  target: number;
  /** Starts counting when this flips true — wire it to an in-view hook. */
  active: boolean;
  /** Milliseconds for the full count. */
  duration?: number;
  /** When true, skip the animation and return `target` immediately. */
  disabled?: boolean;
}

/**
 * Exponential ease-out. Visually matches the `EASE_OUT_EXPO` cubic-bezier used
 * everywhere else, without pulling in a bezier solver for a single number.
 */
function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/**
 * Animates a number from 0 to `target` on `requestAnimationFrame`.
 *
 * Driven by rAF rather than Framer Motion because the output is text content,
 * not a style value — animating it through the style system would mean a
 * `useMotionValue` subscription writing to `textContent` on every frame, which
 * is more machinery for the same result.
 */
export function useCountUp({
  target,
  active,
  duration = 1800,
  disabled = false,
}: UseCountUpOptions): number {
  const [value, setValue] = useState(disabled ? target : 0);
  const frameRef = useRef<number | null>(null);
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (disabled) {
      setValue(target);
      return;
    }
    if (!active || hasRunRef.current) return;

    hasRunRef.current = true;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      setValue(target * easeOutExpo(progress));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        // Land exactly on the target — easing can leave a fractional remainder.
        setValue(target);
      }
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [active, target, duration, disabled]);

  return value;
}
