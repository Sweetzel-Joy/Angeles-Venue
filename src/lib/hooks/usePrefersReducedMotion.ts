'use client';

import { useMediaQuery } from './useMediaQuery';

/**
 * True when the visitor has asked their OS to reduce motion.
 *
 * Used in three places, in increasing order of consequence:
 *   - variant selection (`motionSafe`) — motion becomes a cross-fade
 *   - the 3D scenes — they render one static frame and stop
 *   - `SmoothScrollProvider` — Lenis is not mounted at all
 *
 * That last one matters most. Smooth-scroll libraries take over the scroll
 * wheel, which is precisely the behaviour this setting exists to opt out of.
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
