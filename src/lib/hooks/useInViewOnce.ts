'use client';

import { useEffect, useRef, useState } from 'react';

interface UseInViewOnceOptions {
  /** Fraction of the element that must be visible. */
  threshold?: number;
  /** Standard IntersectionObserver root margin. */
  rootMargin?: string;
}

/**
 * Fires once when an element first enters the viewport, then disconnects.
 *
 * Framer's `useInView` covers most cases, but the counters and the canvas
 * frameloop gate need a plain boolean without a motion component attached, and
 * disconnecting after the first hit means no observer work for the rest of the
 * session.
 */
export function useInViewOnce<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.25,
  rootMargin = '0px',
}: UseInViewOnceOptions = {}): [React.RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Older browsers without IntersectionObserver get the content immediately
    // rather than an element that never reveals.
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return [ref, inView];
}

/**
 * Like `useInViewOnce` but keeps reporting — used to pause the 3D frameloop
 * once the hero scrolls off screen and resume it when it comes back.
 */
export function useIsInView<T extends HTMLElement = HTMLDivElement>(
  rootMargin = '200px',
): [React.RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) setInView(entry.isIntersecting);
      },
      { rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin]);

  return [ref, inView];
}
