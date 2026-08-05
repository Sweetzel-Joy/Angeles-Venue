'use client';

import { useCallback, useRef } from 'react';
import { useMotionValue, useSpring, useTransform, type MotionValue } from 'framer-motion';

interface UseTiltOptions {
  /** Maximum rotation in degrees at the card's edge. */
  maxTilt?: number;
  /** How far the card lifts toward the viewer on hover, in px. */
  lift?: number;
  /** Disables the effect entirely (touch devices, reduced motion). */
  disabled?: boolean;
}

export interface TiltHandlers {
  onPointerMove: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerLeave: () => void;
}

export interface TiltValues {
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
  translateZ: MotionValue<number>;
  /** 0 → 1 across the card's width. Useful for driving a specular sheen. */
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
}

/**
 * Pointer-following 3D tilt.
 *
 * Written by hand rather than pulling in `react-parallax-tilt`: it is ~40 lines
 * of pointer math, and owning it means the spring config matches the rest of the
 * page's motion instead of being a second, unrelated feel.
 *
 * Two details that matter:
 *   - Pointer position is read from `getBoundingClientRect()` on each move
 *     rather than cached, so the tilt stays correct while the card is being
 *     translated by its own scroll-reveal animation.
 *   - Only `rotateX`/`rotateY`/`translateZ` are driven, all composited. The
 *     parent supplies `perspective` via CSS so no layout is involved.
 */
export function useTilt({
  maxTilt = 10,
  lift = 24,
  disabled = false,
}: UseTiltOptions = {}): { handlers: TiltHandlers; values: TiltValues } {
  // -0.5 … 0.5, relative to the card centre.
  const offsetX = useMotionValue(0);
  const offsetY = useMotionValue(0);
  const hovering = useMotionValue(0);
  const frameRef = useRef<number | null>(null);

  const spring = { stiffness: 220, damping: 22, mass: 0.6 } as const;

  const springX = useSpring(offsetX, spring);
  const springY = useSpring(offsetY, spring);
  const springHover = useSpring(hovering, spring);

  // Y offset drives rotateX (pushing the top away tilts the card back).
  const rotateX = useTransform(springY, [-0.5, 0.5], [maxTilt, -maxTilt]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-maxTilt, maxTilt]);
  const translateZ = useTransform(springHover, [0, 1], [0, lift]);
  const pointerX = useTransform(springX, [-0.5, 0.5], [0, 1]);
  const pointerY = useTransform(springY, [-0.5, 0.5], [0, 1]);

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      // Coarse pointers (touch) have no hover state — a tilt that only fires
      // mid-tap is noise, so skip it entirely.
      if (disabled || event.pointerType === 'touch') return;

      const element = event.currentTarget;
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);

      const { clientX, clientY } = event;
      frameRef.current = requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        offsetX.set((clientX - rect.left) / rect.width - 0.5);
        offsetY.set((clientY - rect.top) / rect.height - 0.5);
        hovering.set(1);
      });
    },
    [disabled, offsetX, offsetY, hovering],
  );

  const onPointerLeave = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    offsetX.set(0);
    offsetY.set(0);
    hovering.set(0);
  }, [offsetX, offsetY, hovering]);

  return {
    handlers: { onPointerMove, onPointerLeave },
    values: { rotateX, rotateY, translateZ, pointerX, pointerY },
  };
}
