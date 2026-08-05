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
    area: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="1.5" />
        <path d="M3 9h4V3M21 15h-4v6" />
      </>
    ),
    parking: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M9.5 17V7h3.2a3.1 3.1 0 0 1 0 6.2H9.5" />
      </>
    ),
    stage: (
      <>
        <path d="M2 20h20M4 20V9l8-5 8 5v11" />
        <path d="M9 20v-6h6v6" />
      </>
    ),
    catering: (
      <>
        <path d="M4 18h16a8 8 0 0 0-16 0Z" />
        <path d="M2 21h20M12 10V6" />
        <circle cx="12" cy="4" r="1.2" />
      </>
    ),
    climate: (
      <>
        <path d="M12 2v20M4.5 6.5l15 11M19.5 6.5l-15 11" />
        <path d="M12 6.5 9.5 4M12 6.5 14.5 4M12 17.5 9.5 20M12 17.5l2.5 2.5" />
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
