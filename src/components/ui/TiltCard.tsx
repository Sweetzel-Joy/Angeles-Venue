'use client';

import { motion, useMotionTemplate, useTransform } from 'framer-motion';
import type { ReactNode } from 'react';
import { useTilt } from '@/lib/hooks/useTilt';
import { useIsMobile } from '@/lib/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/utils';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  /** Max rotation in degrees at the card edge. Keep under ~14 to avoid nausea. */
  maxTilt?: number;
  /** How far the card lifts toward the viewer, in px. */
  lift?: number;
  /** Adds a specular highlight that tracks the pointer. */
  sheen?: boolean;
}

/**
 * A card that tilts toward the pointer.
 *
 * Disabled on touch (no hover state to speak of — the tilt would only fire
 * mid-tap) and under reduced motion, falling back to a plain container so
 * nothing shifts in the layout.
 *
 * `perspective` lives on an outer wrapper rather than on the tilting element
 * itself: applied to the element, the vanishing point travels with it and the
 * rotation reads as a skew rather than a 3D turn.
 *
 * Note that every hook runs before the `disabled` branch. Hook order has to be
 * identical on every render, and `disabled` flips from `false` to `true` on the
 * first client effect once the media queries resolve.
 */
export function TiltCard({
  children,
  className,
  maxTilt = 10,
  lift = 20,
  sheen = true,
}: TiltCardProps) {
  const isMobile = useIsMobile();
  const prefersReducedMotion = usePrefersReducedMotion();
  const disabled = isMobile || prefersReducedMotion;

  const { handlers, values } = useTilt({ maxTilt, lift, disabled });

  // The sheen's gradient centre is composed from the pointer motion values, so
  // it updates without React re-rendering the card on every pointer move.
  const sheenX = useTransform(values.pointerX, (v) => `${(v * 100).toFixed(2)}%`);
  const sheenY = useTransform(values.pointerY, (v) => `${(v * 100).toFixed(2)}%`);
  const sheenBackground = useMotionTemplate`radial-gradient(circle at ${sheenX} ${sheenY}, rgba(255, 255, 255, 0.7), transparent 60%)`;

  if (disabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div style={{ perspective: 1200 }} className="will-animate">
      <motion.div
        {...handlers}
        style={{
          rotateX: values.rotateX,
          rotateY: values.rotateY,
          z: values.translateZ,
          transformStyle: 'preserve-3d',
        }}
        className={cn('relative will-animate', className)}
      >
        {children}

        {sheen && (
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-soft-light"
            style={{ background: sheenBackground }}
          />
        )}
      </motion.div>
    </div>
  );
}
