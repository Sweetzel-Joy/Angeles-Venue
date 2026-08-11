'use client';

import type { ReactNode } from 'react';
import { Reveal } from './Reveal';
import { fadeInUp, slideInLeft } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  /** Small uppercase label above the heading. */
  eyebrow: string;
  /** The heading text. Rendered as an <h2> — the page has exactly one <h1>. */
  title: ReactNode;
  /** Optional supporting sentence below the heading. */
  description?: string;
  align?: 'left' | 'center';
  /**
   * Colour treatment for the surface underneath.
   *
   * `default` targets the ivory sections. `tinted` is for the mid-tone
   * backgrounds — on `fern-200` the default `.eyebrow` (clay-600) measures
   * 3.8:1 and the description (ink-muted) 4.2:1, both under the 4.5:1 AA floor.
   * This darkens both rather than leaving a section that looks fine and is not.
   */
  tone?: 'default' | 'tinted';
  /** Links the heading to its section via aria-labelledby. */
  id?: string;
  className?: string;
}

/**
 * Consistent section header.
 *
 * Always an `<h2>`: the page's single `<h1>` lives in the hero, and jumping
 * heading levels or using multiple `<h1>`s is one of the most common ways a
 * visually-fine page becomes unnavigable in a screen reader's outline.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  tone = 'default',
  id,
  className,
}: SectionHeadingProps) {
  const centered = align === 'center';
  const tinted = tone === 'tinted';

  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        centered && 'items-center text-center',
        className,
      )}
    >
      <Reveal variants={centered ? fadeInUp : slideInLeft}>
        {/* `.eyebrow` sets clay-600; the utility wins because utilities are
            layered after components. */}
        <p className={cn('eyebrow', tinted && 'text-clay-700')}>{eyebrow}</p>
      </Reveal>

      <Reveal as="h2" variants={fadeInUp} delay={0.08}>
        <span
          id={id}
          className="block max-w-3xl text-display-sm font-light text-ink md:text-display-md"
        >
          {title}
        </span>
      </Reveal>

      {description && (
        <Reveal variants={fadeInUp} delay={0.16}>
          <p
            className={cn(
              'max-w-xl text-base leading-relaxed',
              tinted ? 'text-ink' : 'text-ink-muted',
              centered && 'mx-auto',
            )}
          >
            {description}
          </p>
        </Reveal>
      )}
    </div>
  );
}
