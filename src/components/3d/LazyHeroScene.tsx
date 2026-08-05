'use client';

import dynamic from 'next/dynamic';

/**
 * Client-only entry points for the 3D scenes.
 *
 * `ssr: false` is not optional here. three.js reads `window` and
 * `document` while its modules evaluate, so any server render of these
 * components throws before it reaches the canvas. Beyond correctness, this also
 * keeps three (~600 KB parsed) out of the initial JS payload entirely — it is
 * fetched as its own chunk after hydration, so the page's text and images are
 * interactive long before the ornament arrives.
 *
 * The `loading` fallback is the same CSS gradient the scenes fall back to, so
 * the swap-in is a settle rather than a flash.
 */

const GradientFallback = () => (
  <div className="scene-fallback absolute inset-0" aria-hidden="true" />
);

export const LazyHeroScene = dynamic(
  () => import('./HeroScene').then((mod) => mod.HeroScene),
  {
    ssr: false,
    loading: GradientFallback,
  },
);

export const LazyFloatingShapes = dynamic(
  () => import('./FloatingShapes').then((mod) => mod.FloatingShapes),
  {
    ssr: false,
    // No fallback: this one is background texture behind a form, and a gradient
    // flashing in behind input fields is worse than nothing appearing at all.
    loading: () => null,
  },
);
