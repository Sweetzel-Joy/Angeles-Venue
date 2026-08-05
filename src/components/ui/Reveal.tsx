'use client';

import { motion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';
import { VIEWPORT, fadeInUp, motionSafe } from '@/lib/animations';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/utils';

/**
 * Tags a reveal may render as.
 *
 * A closed union rather than `ElementType` on purpose. `motion(tag)` builds a
 * *new component type* on every call, so invoking it during render would give
 * React a different type each pass and remount the entire subtree — losing
 * focus, resetting form state, and re-firing the animation. Indexing the
 * pre-built `motion.*` components keeps the type stable across renders.
 */
export type MotionTag =
  | 'div'
  | 'section'
  | 'article'
  | 'header'
  | 'footer'
  | 'nav'
  | 'ul'
  | 'li'
  | 'figure'
  | 'span'
  | 'p'
  | 'h2'
  | 'h3';

interface RevealProps {
  children: ReactNode;
  /** Defaults to `fadeInUp`. Pass any variant set from `lib/animations`. */
  variants?: Variants;
  /** Seconds to wait after the element enters view. */
  delay?: number;
  /** Rendered element — use a semantic tag rather than defaulting to div. */
  as?: MotionTag;
  className?: string;
  /** Fraction visible before triggering. Lower this for very tall elements. */
  amount?: number;
}

/**
 * The standard scroll-reveal wrapper.
 *
 * Centralising this matters for consistency, but mostly for the reduced-motion
 * swap: every reveal on the page goes through one `motionSafe` call, so no
 * section can ship with movement that ignores the setting.
 *
 * `will-animate` applies `will-change` only to elements actually about to move.
 * Applied globally it forces a compositor layer per element and costs more
 * memory than it saves in paint.
 */
export function Reveal({
  children,
  variants = fadeInUp,
  delay = 0,
  as = 'div',
  className,
  amount = VIEWPORT.amount,
}: RevealProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const Tag = motion[as];

  return (
    <Tag
      className={cn('will-animate', className)}
      variants={motionSafe(variants, prefersReducedMotion)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: VIEWPORT.once, amount }}
      transition={delay ? { delay } : undefined}
    >
      {children}
    </Tag>
  );
}

interface RevealGroupProps {
  children: ReactNode;
  /** Defaults to a standard 0.1s stagger. */
  variants?: Variants;
  as?: MotionTag;
  className?: string;
  amount?: number;
}

/**
 * Parent for staggered children.
 *
 * Children only need `variants` — Framer propagates `hidden`/`visible` down the
 * tree automatically. A child that declares its own `whileInView` fights the
 * parent's orchestration and staggers inconsistently, so use `RevealItem`.
 */
export function RevealGroup({
  children,
  variants,
  as = 'div',
  className,
  amount = 0.15,
}: RevealGroupProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const Tag = motion[as];

  // Under reduced motion the container still orchestrates — each child just
  // resolves to a cross-fade, so the sequence reads without any travel.
  const resolved: Variants = variants ?? {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0.04 : 0.1,
        delayChildren: 0.08,
      },
    },
  };

  return (
    <Tag
      className={className}
      variants={resolved}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
    >
      {children}
    </Tag>
  );
}

interface RevealItemProps {
  children: ReactNode;
  variants?: Variants;
  as?: MotionTag;
  className?: string;
}

/** A child of `RevealGroup`. Inherits animation state from its parent. */
export function RevealItem({
  children,
  variants = fadeInUp,
  as = 'div',
  className,
}: RevealItemProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const Tag = motion[as];

  return (
    <Tag
      className={cn('will-animate', className)}
      variants={motionSafe(variants, prefersReducedMotion)}
    >
      {children}
    </Tag>
  );
}
