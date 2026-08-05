/**
 * Conditional class name joiner.
 *
 * Deliberately not `clsx` + `tailwind-merge` — nothing in this project passes
 * conflicting Tailwind classes down through props, so the extra dependencies
 * would earn nothing. If that changes, swap the body out; the signature holds.
 */
export function cn(
  ...classes: ReadonlyArray<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(' ');
}

/** Clamps `value` into the inclusive range [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Formats a counter value with thousands separators. */
export function formatCount(value: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(value));
}
