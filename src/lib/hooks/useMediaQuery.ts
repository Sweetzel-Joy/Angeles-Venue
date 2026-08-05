'use client';

import { useEffect, useState } from 'react';

/**
 * Subscribes to a CSS media query.
 *
 * Returns `false` during SSR and on the first client render, then settles to the
 * real value in an effect. That ordering is deliberate: reading `matchMedia`
 * during render would produce server/client markup mismatches, so callers should
 * treat `false` as "not yet known" and make it the safe default. Every caller
 * here does — mobile degradation and reduced-motion both fall back to the
 * richer experience only *after* we know the query does not match.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** True below the Tailwind `md` breakpoint. */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)');
}
