'use client';

import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';

interface ScrollIndicatorProps {
  /** Anchor to jump to when activated. */
  href: string;
}

/**
 * The "scroll down" hint under the hero.
 *
 * Built as a real anchor rather than a decorative graphic: it points at the next
 * section, so keyboard and screen-reader users get a working shortcut past the
 * hero instead of an animation they cannot use. The moving parts inside are
 * `aria-hidden`; the link itself carries the label.
 */
export function ScrollIndicator({ href }: ScrollIndicatorProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <motion.a
      href={href}
      // An explicit label rather than letting the visible "Scroll" plus a
      // hidden span concatenate into "Scroll Scroll down to the next section".
      aria-label="Scroll down to the next section"
      // White, because its only consumer is the hero, where it sits on the
      // slideshow photographs. `.text-on-photo` carries the glyph shadow that
      // keeps it readable on the light frames — see globals.css.
      className="text-on-photo group inline-flex flex-col items-center gap-3 rounded-full px-3 py-2 text-white transition-colors duration-300 hover:text-clay-200"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: prefersReducedMotion ? 0 : 1.6, duration: 0.8 }}
    >
      <span className="text-[0.7rem] uppercase tracking-eyebrow">Scroll</span>

      <span
        aria-hidden="true"
        className="relative flex h-11 w-6 items-start justify-center rounded-full border border-white/60 pt-2 transition-colors duration-300 group-hover:border-clay-200"
      >
        {/* The travelling dot. Under reduced motion it simply sits still —
            the shape still reads as a mouse, so the meaning survives. */}
        <span
          className={
            prefersReducedMotion
              ? 'h-1.5 w-1.5 rounded-full bg-current'
              : 'h-1.5 w-1.5 animate-scroll-hint rounded-full bg-current'
          }
        />
      </span>
    </motion.a>
  );
}
