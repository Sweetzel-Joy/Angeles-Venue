'use client';

import Image from 'next/image';
import { RevealGroup, RevealItem } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { TiltCard } from '@/components/ui/TiltCard';
import { fadeInUp } from '@/lib/animations';
import { EVENT_TYPES } from '@/lib/content';
import type { EventType } from '@/types';

/**
 * The four event categories, as tilting cards with a staggered entrance.
 *
 * Each card is a real `<a>` wrapping the whole tile rather than a div with an
 * onClick and a nested "learn more" link — one tab stop, one accessible name,
 * and it behaves correctly on middle-click.
 */
export function EventTypes() {
  return (
    <section
      // `id` is the scroll target for the "Services" nav link in NAV_LINKS
      // (src/lib/content.ts). The two must stay in step — a nav href pointing at
      // an id that does not exist fails silently: the hash updates, the page
      // does not move, and nothing is logged.
      id="services"
      aria-labelledby="services-heading"
      className="relative bg-ivory-100 py-24 md:py-36"
    >
      <div className="container-page flex flex-col gap-14">
        <SectionHeading
          id="services-heading"
          eyebrow="What we host"
          title="Four kinds of night, one address"
          description="Each layout is a different room. Tell us which one you need and we will show you how it comes together."
          align="center"
          className="mx-auto"
        />

        <RevealGroup
          as="ul"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          amount={0.1}
        >
          {EVENT_TYPES.map((eventType) => (
            <RevealItem key={eventType.id} as="li" variants={fadeInUp}>
              <EventCard eventType={eventType} />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

function EventCard({ eventType }: { eventType: EventType }) {
  return (
    <TiltCard maxTilt={9} lift={22} className="h-full rounded-2xl">
      <a
        href="#booking"
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ink/8 bg-ivory-50 shadow-soft transition-shadow duration-500 hover:shadow-lift"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-ivory-200">
          <Image
            src={eventType.image.src}
            alt={eventType.image.alt}
            fill
            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 23vw"
            // Scale on hover only — `object-cover` + `fill` means no reflow.
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/10 to-transparent"
          />
          <h3 className="absolute inset-x-5 bottom-4 font-display text-2xl font-light text-ivory-50">
            {eventType.title}
          </h3>
        </div>

        <div className="flex flex-1 flex-col gap-4 p-5">
          <p className="text-sm leading-relaxed text-ink-muted">
            {eventType.description}
          </p>

          <ul className="mt-auto flex flex-col gap-1.5 border-t border-ink/8 pt-4">
            {eventType.highlights.map((highlight) => (
              <li
                key={highlight}
                className="flex items-center gap-2 text-xs text-ink-faint"
              >
                <span
                  aria-hidden="true"
                  className="h-1 w-1 shrink-0 rounded-full bg-clay-400"
                />
                {highlight}
              </li>
            ))}
          </ul>

          <span className="flex items-center gap-1.5 text-sm font-medium text-clay-600">
            Enquire
            <span
              aria-hidden="true"
              className="transition-transform duration-300 ease-out group-hover:translate-x-1 motion-reduce:transition-none"
            >
              →
            </span>
          </span>
        </div>
      </a>
    </TiltCard>
  );
}
