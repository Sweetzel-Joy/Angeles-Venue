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
  id,
  className,
}: SectionHeadingProps) {
  const centered = align === 'center';

  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        centered && 'items-center text-center',
        className,
      )}
    >
      <Reveal variants={centered ? fadeInUp : slideInLeft}>
        <p className="eyebrow">{eyebrow}</p>
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
              'max-w-xl text-base leading-relaxed text-ink-muted',
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
