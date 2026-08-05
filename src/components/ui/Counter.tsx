'use client';

import { useCountUp } from '@/lib/hooks/useCountUp';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { formatCount } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface CounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  /** Starts the count. Wire this to an in-view hook on the parent. */
  active: boolean;
  className?: string;
}

/**
 * A number that counts up when it scrolls into view.
 *
 * The accessible value and the animated value are deliberately separated. A
 * screen reader encountering a live-updating number reads a stream of
 * meaningless intermediate values, so the animated digits are `aria-hidden` and
 * the final figure is exposed once, in a visually-hidden span. Assistive tech
 * gets "250 seated guests"; everyone else gets the animation.
 *
 * `tabular-nums` keeps the glyph widths fixed, so the surrounding layout does
 * not jitter as the digits change.
 */
export function Counter({ value, prefix, suffix, active, className }: CounterProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const current = useCountUp({
    target: value,
    active,
    disabled: prefersReducedMotion,
  });

  const finalLabel = `${prefix ?? ''}${formatCount(value)}${suffix ?? ''}`;

  return (
    <span className={cn('tabular-nums', className)}>
      <span aria-hidden="true">
        {prefix}
        {formatCount(current)}
        {suffix}
      </span>
      <span className="sr-only">{finalLabel}</span>
    </span>
  );
}
