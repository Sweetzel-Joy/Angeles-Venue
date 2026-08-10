import Image from 'next/image';
import { cn } from '@/lib/utils';

/** The four cropped botanicals, with their real pixel dimensions. */
const LEAVES = {
  outlineTan: { src: '/images/leaf-outline-tan.png', width: 282, height: 520 },
  frondTan: { src: '/images/leaf-frond-tan.png', width: 293, height: 520 },
  sprigSage: { src: '/images/leaf-sprig-sage.png', width: 520, height: 363 },
  branchGreen: { src: '/images/leaf-branch-green.png', width: 520, height: 465 },
} as const;

type LeafKey = keyof typeof LEAVES;
type Placement = { leaf: LeafKey; className: string };

/**
 * A different arrangement per section, so the same four files do not read as
 * one wallpaper repeated down the page.
 *
 * **Fixed arrangements, not `Math.random()`** — and that is not laziness:
 *
 *  - These sections are server-rendered. Random on the server and random again
 *    on the client are different answers, which is a hydration mismatch.
 *  - Sections re-render on scroll (parallax, counters, the carousel timer), so
 *    a random pick would visibly reshuffle while someone is reading.
 *
 * Variety comes from using different leaves, sizes, rotations and mirroring in
 * each variant instead. Same effect for a visitor, none of the instability.
 */
const VARIANTS = {
  /** Long section — larger leaves spread down both edges. */
  services: [
    { leaf: 'sprigSage', className: '-left-16 top-10 w-[240px] -rotate-[14deg] lg:w-[300px]' },
    { leaf: 'frondTan', className: '-right-16 top-1/3 w-[190px] rotate-[18deg] lg:w-[230px]' },
    { leaf: 'branchGreen', className: '-left-12 bottom-8 w-[230px] scale-x-[-1] rotate-6 lg:w-[280px]' },
  ],
  /*
    Denser, with a deliberately overlapping pair on the left.

    The pair is a solid tan frond under a pale green watercolour sprig, and the
    contrast is the point: the wrapper carries the opacity, not the individual
    images, so the group composites at full strength and is faded as a whole.
    The overlap therefore reads as one leaf occluding another rather than
    darkening into a patch — which only shows if the two differ in weight and
    colour.

    All four placements sit outside the quote. The carousel is `max-w-3xl`
    (768px) centred, leaving roughly 336px of clear margin each side at 1440.
  */
  stories: [
    { leaf: 'outlineTan', className: '-right-14 top-6 w-[200px] rotate-[24deg] lg:w-[250px]' },
    { leaf: 'branchGreen', className: '-left-16 bottom-4 w-[220px] -rotate-[8deg] lg:w-[270px]' },
    // The overlapping pair — frond first so the sprig crosses in front of it.
    { leaf: 'frondTan', className: '-left-12 top-8 w-[200px] rotate-[16deg] lg:w-[240px]' },
    { leaf: 'sprigSage', className: 'left-4 top-24 w-[210px] -rotate-[24deg] lg:w-[260px]' },
  ],
  /** Dense with links — smaller and fainter so they stay out of the way. */
  footer: [
    { leaf: 'frondTan', className: '-left-10 top-2 w-[140px] scale-x-[-1] rotate-[10deg] lg:w-[170px]' },
    { leaf: 'sprigSage', className: '-right-12 top-8 w-[180px] rotate-[6deg] lg:w-[220px]' },
    { leaf: 'outlineTan', className: '-right-8 bottom-2 w-[130px] -rotate-[18deg] lg:w-[160px]' },
  ],
} as const satisfies Record<string, readonly Placement[]>;

export type LeafDecorVariant = keyof typeof VARIANTS;

interface LeafDecorProps {
  variant: LeafDecorVariant;
  /** Footer sits under denser content, so it takes a lighter hand. */
  opacityClassName?: string;
}

/**
 * Decorative botanicals bled off a section's edges.
 *
 * Three things the host section must provide, all of which fail quietly:
 *
 *  - **`overflow-hidden`.** `globals.css` clips `section` on the x-axis only,
 *    so a leaf bleeding off the bottom would spill into the next section — and
 *    the footer is a `<footer>`, which that rule does not match at all.
 *  - **`relative`**, or these position themselves against the wrong ancestor.
 *  - **`relative z-10` on its content.** These are absolutely positioned and
 *    content containers usually are not, so without it the leaves paint over
 *    the text. A negative z-index is not the fix: every host paints its own
 *    background and would hide them entirely.
 */
export function LeafDecor({ variant, opacityClassName = 'opacity-[0.15]' }: LeafDecorProps) {
  return (
    <div
      aria-hidden="true"
      // Hidden below `md`: these sections stack into tall, text-dense columns
      // there, and a 500px leaf against a 390px viewport is clutter.
      className={cn('pointer-events-none absolute inset-0 hidden md:block', opacityClassName)}
    >
      {VARIANTS[variant].map(({ leaf, className }) => {
        const { src, width, height } = LEAVES[leaf];
        return (
          <Image
            key={`${variant}-${leaf}-${className}`}
            src={src}
            alt=""
            width={width}
            height={height}
            className={cn('absolute h-auto select-none', className)}
          />
        );
      })}
    </div>
  );
}
