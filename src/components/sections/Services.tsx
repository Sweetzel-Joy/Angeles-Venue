'use client';

import { LinkButton } from '@/components/ui/Button';
import { Reveal, RevealGroup, RevealItem } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { TiltCard } from '@/components/ui/TiltCard';
import { fadeInUp } from '@/lib/animations';
import { SERVICE_ADDONS, SERVICE_PACKAGES } from '@/lib/content';
import type { ServicePackage } from '@/types';

/**
 * The venue's bookable packages and the extras available alongside them.
 *
 * **No prices anywhere.** The venue quotes on enquiry, so this section lists
 * what each package includes and routes people to the booking form for rates.
 * `ServicePackage` has no price field, so this is enforced by the type rather
 * than by remembering.
 */
export function Services() {
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
          eyebrow="What we offer"
          title="Three ways to book the space"
          description="Every package includes the venue itself. Tell us the date and the headcount and we will come back with a quote."
          align="center"
          className="mx-auto"
        />

        <RevealGroup
          as="ul"
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
          amount={0.1}
        >
          {SERVICE_PACKAGES.map((servicePackage, index) => (
            <RevealItem key={servicePackage.id} as="li" variants={fadeInUp}>
              <PackageCard
                servicePackage={servicePackage}
                // Only the first package is standalone; the other two are
                // "Place + …", so they build on it rather than replacing it.
                buildsOnBase={index > 0}
              />
            </RevealItem>
          ))}
        </RevealGroup>

        {/* Extras, charged separately. A plain list rather than more cards —
            these are line items, not packages, and giving them equal visual
            weight would bury the three things people actually choose between. */}
        <Reveal variants={fadeInUp}>
          <div className="rounded-2xl border border-ink/8 bg-ivory-50 p-6 shadow-soft sm:p-8">
            <h3 className="eyebrow">Also available, charged separately</h3>
            <ul className="mt-5 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICE_ADDONS.map((addOn) => (
                <li
                  key={addOn.id}
                  className="flex items-baseline gap-2 text-sm text-ink"
                >
                  <span
                    aria-hidden="true"
                    className="mt-1.5 h-1 w-1 shrink-0 self-start rounded-full bg-clay-400"
                  />
                  <span>
                    {addOn.label}
                    {addOn.note && (
                      <span className="text-ink-faint"> — {addOn.note}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* Prices are not published, so the route to them has to be obvious. */}
        <Reveal variants={fadeInUp} className="flex flex-col items-center gap-4">
          <p className="text-center text-base text-ink-muted">
            Rates are quoted per booking, based on your date and setup.
          </p>
          <LinkButton href="#booking" size="lg">
            Ask for a quote
          </LinkButton>
        </Reveal>
      </div>
    </section>
  );
}

interface PackageCardProps {
  servicePackage: ServicePackage;
  buildsOnBase: boolean;
}

function PackageCard({ servicePackage, buildsOnBase }: PackageCardProps) {
  return (
    <TiltCard maxTilt={7} lift={16} className="h-full rounded-2xl">
      <article className="flex h-full flex-col gap-5 rounded-2xl border border-ink/8 bg-ivory-50 p-6 shadow-soft sm:p-7">
        <header className="flex flex-col gap-2">
          <h3 className="font-display text-2xl font-light text-ink">
            {servicePackage.name}
          </h3>
          <p className="text-sm leading-relaxed text-ink-muted">
            {servicePackage.summary}
          </p>
        </header>

        <div className="flex flex-1 flex-col gap-3 border-t border-ink/8 pt-5">
          {buildsOnBase && (
            <p className="text-xs font-medium uppercase tracking-wider text-clay-600">
              Everything in Place only, plus
            </p>
          )}

          <ul className="flex flex-col gap-2.5">
            {servicePackage.inclusions.map((inclusion) => (
              <li
                key={inclusion}
                className="flex items-baseline gap-2.5 text-sm leading-relaxed text-ink"
              >
                <span
                  aria-hidden="true"
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 self-start rounded-full bg-sage-400"
                />
                {inclusion}
              </li>
            ))}
          </ul>
        </div>
      </article>
    </TiltCard>
  );
}
