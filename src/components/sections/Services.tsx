'use client';

import { LinkButton } from '@/components/ui/Button';
import { LeafDecor } from '@/components/ui/LeafDecor';
import { Reveal, RevealGroup, RevealItem } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { TiltCard } from '@/components/ui/TiltCard';
import { fadeInUp } from '@/lib/animations';
import { SERVICE_ADDONS, SERVICE_PACKAGES } from '@/lib/content';
import { cn } from '@/lib/utils';
import type { ServicePackage } from '@/types';

/**
 * Per-card colour, applied by position so the three tiers are distinguishable
 * at a glance.
 *
 * Two things to keep in mind when editing these:
 *
 *  1. **Write complete class strings.** Tailwind's JIT scans source text, so a
 *     built-up name like `` `from-${tone}-200` `` compiles to no CSS at all and
 *     the card silently falls back to looking flat.
 *  2. **Keep the tints light.** The card summary is `text-ink-muted`
 *     (`#6B6155`); against a full-strength `sage-200` it measures about 3.98:1,
 *     under the 4.5:1 AA floor. The washes below are held at roughly
 *     `sage-100` weight so the text stays legible — colour that costs
 *     readability is not a win. There is a contrast check in
 *     `scratchpad/verify` that measures the painted pixels, not the intent.
 */
interface CardTone {
  surface: string;
  /**
   * The extra wash faded in on hover, painted as an overlay on top of
   * `surface` rather than replacing it.
   *
   * Deliberately not `hover:from-sage-300` on the card itself: that changes
   * `--tw-gradient-from`, an unregistered custom property, which CSS cannot
   * interpolate — the colour would jump instead of fading. Animating an
   * overlay's `opacity` interpolates properly.
   *
   * These strengths were set by measuring painted contrast with the hover held,
   * not by eye — see point 2 above. Raising them is the easy way to push the
   * summary text back under 4.5:1.
   */
  hoverWash: string;
  border: string;
  bullet: string;
  label: string;
}

const CARD_TONES: readonly CardTone[] = [
  {
    surface:
      'bg-gradient-to-b from-sage-200/70 from-0% via-ivory-50 via-45% to-ivory-50',
    hoverWash:
      'bg-gradient-to-b from-sage-300/40 from-0% via-transparent via-45% to-transparent',
    border: 'border-sage-300/50',
    bullet: 'bg-sage-400',
    label: 'text-sage-800',
  },
  {
    surface:
      'bg-gradient-to-b from-clay-200/75 from-0% via-ivory-50 via-45% to-ivory-50',
    hoverWash:
      'bg-gradient-to-b from-clay-300/40 from-0% via-transparent via-45% to-transparent',
    border: 'border-clay-300/45',
    bullet: 'bg-clay-400',
    label: 'text-clay-700',
  },
  {
    surface:
      'bg-gradient-to-b from-sage-400/60 from-0% via-ivory-50 via-45% to-ivory-50',
    // Lighter than the other two on purpose: this tone's resting surface is
    // already the darkest (`sage-400/60`), so a /35 wash took the summary text
    // to 4.57:1 — over AA by 0.07, which is no margin at all.
    //
    // `/20`, not `/22`: opacity modifiers must be steps Tailwind actually
    // generates. `/22` is not one, and it did not fail loudly — it compiled to
    // `rgba(154, 174, 138, 0.6)`, nearly three times the intended strength, and
    // pushed the text down to 4.33:1. Same trap as the docblock above.
    hoverWash:
      'bg-gradient-to-b from-sage-400/20 from-0% via-transparent via-45% to-transparent',
    border: 'border-sage-400/50',
    bullet: 'bg-sage-600',
    label: 'text-sage-800',
  },
];

/** Fallback so an added fourth package renders rather than crashing. */
const DEFAULT_TONE = CARD_TONES[0] as CardTone;

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
      // `overflow-hidden` for the botanicals below: globals.css only clips
      // `section` on the x-axis, so a leaf bleeding off the bottom would spill
      // into the next section.
      className="relative overflow-hidden bg-ivory-100 py-24 md:py-36"
    >
      <LeafDecor variant="services" />

      {/* `relative z-10` keeps the cards above the decor. Not `-z-10` on the
          leaves: this section paints its own `bg-ivory-100` and would hide
          them. */}
      <div className="container-page relative z-10 flex flex-col gap-14">
        <SectionHeading
          id="services-heading"
          eyebrow="What we offer"
          title="Pick your package"
          description="Start with the venue, add what you need. Tell us the date and the headcount and we will come back with a quote."
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
                tone={CARD_TONES[index] ?? DEFAULT_TONE}
              />
            </RevealItem>
          ))}
        </RevealGroup>

        {/* Extras, charged separately. A plain list rather than more cards —
            these are line items, not packages, and giving them equal visual
            weight would bury the three things people actually choose between. */}
        <Reveal variants={fadeInUp}>
          {/* Same hover treatment as the package cards above — see PackageCard
              for why the tint is an overlay and why `motion-always` is needed.
              A gentler lift, because this is a wide, shallow block: the 6px the
              cards use reads as a jolt at this aspect ratio. */}
          <div
            className={cn(
              'group relative rounded-2xl border border-sage-300/35 p-6 shadow-soft sm:p-8',
              'bg-gradient-to-b from-sage-200/30 via-ivory-50 to-ivory-50',
              'motion-always transition-[transform,box-shadow] duration-300 ease-out',
              'hover:-translate-y-1 hover:shadow-lift',
            )}
          >
            {/* Weaker than the cards' wash (/20, against their /40). The
                eyebrow sits right at the top edge where the wash is strongest
                and it is small clay-on-ivory text, so it has the least contrast
                headroom on the page: /25 measured 4.62:1 hovered, over AA but
                only just. The block's top is also translucent
                (`from-sage-200/30`), so a LeafDecor botanical behind it darkens
                the reading further. */}
            <span
              aria-hidden="true"
              className="motion-always pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-sage-300/20 from-0% via-transparent via-60% to-transparent opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
            />

            <h3 className="eyebrow relative z-10">Also available, charged separately</h3>
            <ul className="relative z-10 mt-5 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
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
            Rates depends on your setup — every booking gets a custom quote.
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
  tone: CardTone;
}

function PackageCard({ servicePackage, buildsOnBase, tone }: PackageCardProps) {
  return (
    <TiltCard maxTilt={7} lift={16} className="h-full rounded-2xl">
      <article
        className={cn(
          'group relative flex h-full flex-col gap-5 rounded-2xl border p-6 shadow-soft sm:p-7',
          // `motion-always` (globals.css) exempts these transitions from the
          // global reduced-motion backstop, which would otherwise collapse them
          // to 0.01ms and make the hover snap. The tilt from TiltCard stays
          // disabled under reduced motion — a 3D rotation is the part that
          // actually provokes motion sickness; a lift and a shadow are not.
          'motion-always transition-[transform,box-shadow] duration-300 ease-out',
          'hover:-translate-y-1.5 hover:shadow-lift',
          tone.surface,
          tone.border,
        )}
      >
        {/* The hover tint. Sits behind the content by way of the `relative
            z-10` on the two blocks below — positioned elements paint above
            static siblings regardless of source order, so without those this
            would wash over the text rather than under it. */}
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-0 rounded-2xl opacity-0',
            // `motion-always` again: the class marks individual elements, not
            // subtrees, so the overlay needs its own even though its parent
            // has one.
            'motion-always transition-opacity duration-300 ease-out group-hover:opacity-100',
            tone.hoverWash,
          )}
        />

        <header className="relative z-10 flex flex-col gap-2">
          <h3 className="font-display text-2xl font-light text-ink">
            {servicePackage.name}
          </h3>
          <p className="text-sm leading-relaxed text-ink-muted">
            {servicePackage.summary}
          </p>
        </header>

        <div className="relative z-10 flex flex-1 flex-col gap-3 border-t border-ink/10 pt-5">
          {buildsOnBase && (
            <p
              className={cn(
                'text-xs font-medium uppercase tracking-wider',
                tone.label,
              )}
            >
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
                  className={cn(
                    'mt-1.5 h-1.5 w-1.5 shrink-0 self-start rounded-full',
                    tone.bullet,
                  )}
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
