import type { SocialIconName } from '@/types';

/**
 * Inline line icons, drawn to one convention.
 *
 * This project carries no icon library — every mark is hand-written SVG so the
 * bundle stays free of a dependency for a dozen glyphs. That only works if they
 * are drawn consistently, so the wrapper below owns the whole convention
 * (24-unit box, no fill, `currentColor` stroke at 1.4, round caps and joins) and
 * each entry contributes geometry only. An icon that sets its own stroke width
 * or viewBox will not sit with the others.
 *
 * Every icon is `aria-hidden` and `focusable="false"`. These are decorative:
 * they sit beside a visible text label in every current use, and announcing
 * them would give a screen reader "graphic, Call us" instead of "Call us".
 * `focusable="false"` is specifically for IE/older Edge, which otherwise put
 * SVGs in the tab order.
 */
const PATHS = {
  /** Handset, tilted — reads as "phone" at 16px where a flat one does not. */
  phone: (
    <path d="M6.4 3.5h3l1.5 3.7-1.9 1.1a11.5 11.5 0 0 0 5.7 5.7l1.1-1.9 3.7 1.5v3a1.9 1.9 0 0 1-2.1 1.9A16.4 16.4 0 0 1 4.5 5.6 1.9 1.9 0 0 1 6.4 3.5Z" />
  ),
  mail: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="m3.8 7 7.1 5.2a2 2 0 0 0 2.2 0L20.2 7" />
    </>
  ),
  /** Map pin. The dot is filled — an outlined dot turns to mush at 16px. */
  pin: (
    <>
      <path d="M12 21s6.5-6 6.5-10.4a6.5 6.5 0 1 0-13 0C5.5 15 12 21 12 21Z" />
      <circle cx="12" cy="10.4" r="1.6" fill="currentColor" stroke="none" />
    </>
  ),

  /* Social marks. Lifted verbatim from the footer, which used to define its own
     copy of these — the Facebook path in particular now had two homes. */
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="3.8" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  facebook: (
    <path d="M14.5 8.5h2.2V5.6h-2.6c-2.2 0-3.6 1.4-3.6 3.6v1.7H8.3v2.9h2.2V21h3V13.8h2.3l.4-2.9h-2.7V9.6c0-.7.3-1.1 1-1.1Z" />
  ),
  tiktok: (
    <path d="M15 3.5c.4 2.1 1.8 3.5 3.9 3.7v2.7c-1.4.1-2.7-.3-3.9-1.1v5.6c0 3.2-2.4 5.6-5.4 5.6a5.3 5.3 0 0 1 0-10.6c.3 0 .6 0 .9.1v2.9a2.5 2.5 0 1 0 1.7 2.4V3.5Z" />
  ),
  youtube: (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="M10.5 9.5v5l4.2-2.5Z" fill="currentColor" stroke="none" />
    </>
  ),
} as const;

export type IconName = keyof typeof PATHS;

/*
  Compile-time guarantee that every social platform in `SocialIconName` has a
  mark here. Without it, adding a platform to the type would render an empty
  <svg> — a link with no visible content, which nothing would flag.
*/
type _EverySocialCovered = SocialIconName extends IconName ? true : never;
const _socialsCovered: _EverySocialCovered = true;
void _socialsCovered;

interface IconProps {
  name: IconName;
  /** Sizing and colour come from the caller, e.g. `h-4 w-4`. */
  className?: string;
  /** Rendered size in px. The footer's socials use 18; contact rows use 16. */
  size?: number;
}

export function Icon({ name, className, size = 18 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {PATHS[name]}
    </svg>
  );
}
