'use client';

import { ReactLenis } from 'lenis/react';
import type { ReactNode } from 'react';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';

interface SmoothScrollProviderProps {
  children: ReactNode;
}

/**
 * Inertial scrolling via Lenis.
 *
 * The important behaviour here is the *absence* of Lenis when the visitor has
 * `prefers-reduced-motion: reduce` set. A smooth-scroll library takes ownership
 * of the wheel and interpolates every scroll position — which is exactly the
 * class of motion that setting exists to switch off. Passing Lenis a shorter
 * duration would not be enough; the honest response is to not mount it, and let
 * the browser scroll natively.
 *
 * Because Lenis drives `window.scrollY` (rather than transforming a wrapper
 * element), Framer Motion's `useScroll` reads correct values with no scroller
 * proxy, and in-page `#anchor` links still work.
 */
export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return <>{children}</>;
  }

  return (
    <ReactLenis
      root
      options={{
        // ~1s to settle: long enough to read as cinematic, short enough that
        // the page still feels responsive to a flick.
        duration: 1.1,
        lerp: 0.1,
        smoothWheel: true,
        // Touch devices already have native inertia. Overriding it makes the
        // page feel laggy and breaks the platform scroll feel users expect.
        syncTouch: false,
        wheelMultiplier: 1,
        touchMultiplier: 1.6,
      }}
    >
      {children}
    </ReactLenis>
  );
}
