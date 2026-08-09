'use client';

import { Counter } from '@/components/ui/Counter';
import { RevealGroup, RevealItem } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { fadeInUp } from '@/lib/animations';
import { AMENITIES } from '@/lib/content';
import { useInViewOnce } from '@/lib/hooks/useInViewOnce';
import type { Amenity, AmenityIconName } from '@/types';

/**
 * Venue facts, with counters that run when the grid scrolls into view.
 *
 * One `useInViewOnce` on the grid drives every counter, rather than one
 * observer per tile. Beyond being cheaper, it means the numbers all start
 * together — staggered counters read as a loading state rather than a flourish.
 */
export function Amenities() {
  const [gridRef, inView] = useInViewOnce<HTMLDivElement>({ threshold: 0.2 });

  return (
    <section
      id="venue"
      aria-labelledby="venue-heading"
      className="relative overflow-hidden bg-sage-100 py-24 md:py-36"
    >
      {/* Subtle warm wash so the sage block does not read as a flat slab. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_20%_0%,rgba(224,169,139,0.22),transparent_70%)]"
      />

      <div className="container-page relative flex flex-col gap-14">
        <SectionHeading
          id="venue-heading"
          eyebrow="The specifics"
          title="Everything you need to plan around"
          description="The numbers people ask for first. Full technical specifications and floor plans are available on request."
        />

        <div ref={gridRef}>
          <RevealGroup
            as="ul"
            className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3"
          >
            {AMENITIES.map((amenity) => (
              <RevealItem key={amenity.id} as="li" variants={fadeInUp}>
                <AmenityTile amenity={amenity} active={inView} />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}

function AmenityTile({ amenity, active }: { amenity: Amenity; active: boolean }) {
  return (
    <div className="flex flex-col gap-3 border-t border-ink/12 pt-6">
      <span className="text-clay-600">
        <AmenityIcon name={amenity.icon} />
      </span>

      <p className="font-display text-5xl font-light leading-none text-ink">
        <Counter
          value={amenity.value}
          prefix={amenity.prefix}
          suffix={amenity.suffix}
          active={active}
        />
      </p>

      <h3 className="font-sans text-sm font-medium uppercase tracking-wider text-ink">
        {amenity.label}
      </h3>
      <p className="text-sm leading-relaxed text-ink-muted">{amenity.description}</p>
    </div>
  );
}

/**
 * Inline SVG icons.
 *
 * Hand-drawn rather than pulled from an icon package: six icons do not justify
 * a dependency, and inlining means they inherit `currentColor` and add nothing
 * to the network waterfall.
 */
function AmenityIcon({ name }: { name: AmenityIconName }) {
  const paths: Record<AmenityIconName, React.ReactNode> = {
    guests: (
      <>
        <circle cx="9" cy="8" r="3.2" />
        <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
        <path d="M16 5.5a3 3 0 0 1 0 5.8M17.5 14.4c2.1.8 3.5 2.8 3.5 5.1" />
      </>
    ),
    hours: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 6.8V12l3.6 2.2" />
      </>
    ),
    chairs: (
      <>
        <path d="M7 4h10l-.9 8H7.9L7 4Z" />
        <path d="M7.6 12h8.8l.9 4H6.7l.9-4Z" />
        <path d="M8 16l-.8 4M16 16l.8 4" />
      </>
    ),
    wifi: (
      <>
        <path d="M2.5 8.6a15 15 0 0 1 19 0" />
        <path d="M5.8 12.3a10 10 0 0 1 12.4 0" />
        <path d="M9.1 15.9a5 5 0 0 1 5.8 0" />
        <circle cx="12" cy="19.4" r="1" fill="currentColor" stroke="none" />
      </>
    ),
    water: (
      <>
        <path d="M9 2.6h6v2.2l-1 1.2h-4l-1-1.2V2.6Z" />
        <path d="M10 6h4c2.2 1 3.6 3 3.6 5.4v6.4A3.2 3.2 0 0 1 14.4 21H9.6a3.2 3.2 0 0 1-3.2-3.2v-6.4C6.4 9 7.8 7 10 6Z" />
        <path d="M6.6 14.4c1.6-1.2 3.2-1.2 4.8 0s3.2 1.2 4.8 0" />
      </>
    ),
  };

  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      // Decorative: the label and description next to it carry the meaning.
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
}
