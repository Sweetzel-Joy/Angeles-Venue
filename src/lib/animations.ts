import type { Transition, Variants } from 'framer-motion';

/**
 * Shared Framer Motion variants.
 *
 * Everything on the page pulls its motion from this file so the timing feels
 * authored rather than accidental. Two rules hold throughout:
 *
 *  1. Only `transform` and `opacity` are animated. No width/height/top/left —
 *     those trigger layout on every frame and are the usual cause of scroll jank.
 *  2. Distances stay small (16–48px). Large travel reads as a page that hasn't
 *     finished loading rather than as deliberate motion.
 */

/** easeOutExpo — fast departure, long settle. The house easing curve. */
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/** easeInOutQuart — for reversible motion (drawers, carousels). */
export const EASE_IN_OUT_QUART = [0.76, 0, 0.24, 1] as const;

export const DURATION = {
  fast: 0.35,
  base: 0.6,
  slow: 0.9,
  scene: 1.4,
} as const;

const baseTransition: Transition = {
  duration: DURATION.base,
  ease: EASE_OUT_EXPO,
};

/**
 * Default `viewport` prop for `whileInView`.
 *
 * `once: true` matters for more than performance — re-animating on every scroll
 * past makes long pages feel unstable, and it re-triggers motion for people who
 * are simply scrolling back to re-read something.
 */
export const VIEWPORT = { once: true, amount: 0.25 } as const;

/** Looser trigger for tall elements that never reach 25% visibility at once. */
export const VIEWPORT_LOOSE = { once: true, amount: 0.1 } as const;

/* -------------------------------------------------------------------------- */
/*  Core variants                                                             */
/* -------------------------------------------------------------------------- */

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: baseTransition },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: baseTransition },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -24 },
  visible: { opacity: 1, y: 0, transition: baseTransition },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -48 },
  visible: { opacity: 1, x: 0, transition: baseTransition },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 48 },
  visible: { opacity: 1, x: 0, transition: baseTransition },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { ...baseTransition, duration: DURATION.slow },
  },
};

/**
 * Orchestration-only parent for `clipReveal`.
 *
 * This wrapper exists for a specific reason. `clipReveal`'s hidden state clips
 * its element to zero visible area, and Chromium's IntersectionObserver reports
 * an empty intersection rect for a self-clipped element — so an element that
 * carries both `clipReveal` *and* `whileInView` can never be seen entering the
 * viewport, and stays hidden forever. (Worse, a clipped `next/image` inside it
 * is never even requested, because lazy loading uses the same visibility
 * signal.)
 *
 * Splitting the two fixes it: this variant goes on the observed parent, which
 * is never clipped, and `clipReveal` goes on a child that inherits the parent's
 * animation state.
 */
export const clipRevealContainer: Variants = {
  hidden: {},
  visible: {},
};

/**
 * Gallery reveal — the image is wiped in from the bottom edge via clip-path
 * while easing off a slight zoom, so the frame and its contents move
 * independently. `clip-path` is compositor-friendly in modern browsers.
 *
 * Must be applied to a child of `clipRevealContainer`, never directly to a
 * `whileInView` element — see the note above.
 */
export const clipReveal: Variants = {
  hidden: { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.08 },
  visible: {
    clipPath: 'inset(0% 0% 0% 0%)',
    scale: 1,
    transition: { duration: DURATION.scene, ease: EASE_OUT_EXPO },
  },
};

/* -------------------------------------------------------------------------- */
/*  Orchestration                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Parent for staggered lists. Children inherit `hidden`/`visible` automatically,
 * so children need no `initial`/`whileInView` of their own — only `variants`.
 */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.08 },
  },
};

/** Tighter stagger for dense lists (amenity grid, nav items). */
export const staggerFast: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05, delayChildren: 0.04 },
  },
};

/** Per-word headline reveal. Pair with `wordChild` on each word span. */
export const wordContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

export const wordChild: Variants = {
  hidden: { opacity: 0, y: '0.6em' },
  visible: {
    opacity: 1,
    y: '0em',
    transition: { duration: DURATION.slow, ease: EASE_OUT_EXPO },
  },
};

/* -------------------------------------------------------------------------- */
/*  Component-specific                                                        */
/* -------------------------------------------------------------------------- */

/** Testimonial carousel. `custom` carries direction: 1 = next, -1 = previous. */
export const carouselSlide: Variants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 64 : -64,
  }),
  center: {
    opacity: 1,
    x: 0,
    transition: { duration: DURATION.base, ease: EASE_OUT_EXPO },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -64 : 64,
    transition: { duration: DURATION.fast, ease: EASE_IN_OUT_QUART },
  }),
};

export const drawerSlide: Variants = {
  hidden: { opacity: 0, x: '100%' },
  visible: {
    opacity: 1,
    x: '0%',
    transition: { duration: DURATION.fast, ease: EASE_IN_OUT_QUART },
  },
  exit: {
    opacity: 0,
    x: '100%',
    transition: { duration: 0.25, ease: EASE_IN_OUT_QUART },
  },
};

export const lightboxBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const lightboxPanel: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: DURATION.fast, ease: EASE_OUT_EXPO },
  },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.2 } },
};

/* -------------------------------------------------------------------------- */
/*  Reduced motion                                                            */
/* -------------------------------------------------------------------------- */

/**
 * The single variant set used when `prefers-reduced-motion: reduce` is on.
 *
 * That setting asks us to remove *movement*, not feedback — so opacity stays
 * (it still signals that something arrived) while every translation, scale and
 * clip animation is dropped, since those are what trigger vestibular
 * discomfort. Swapping the whole variant object is more reliable than trying to
 * strip keys out of each one.
 */
export const reducedMotionVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

/** Picks between a variant set and its reduced-motion equivalent. */
export function motionSafe(
  variants: Variants,
  prefersReducedMotion: boolean,
): Variants {
  return prefersReducedMotion ? reducedMotionVariants : variants;
}
