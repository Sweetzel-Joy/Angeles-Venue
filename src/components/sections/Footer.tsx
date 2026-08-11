'use client';

import Image from 'next/image';
import { Icon, type IconName } from '@/components/ui/Icon';
import { LeafDecor } from '@/components/ui/LeafDecor';
import { Reveal } from '@/components/ui/Reveal';
import { NAV_LINKS, VENUE } from '@/lib/content';

interface ContactRow {
  icon: IconName;
  /** Visible text, one entry per line. The address needs two. */
  lines: readonly string[];
  /** Omitted for the address, which is text rather than a link. */
  href?: string;
  /** `<address>` for the postal address, plain text otherwise. */
  isAddress?: boolean;
}

/**
 * The footer's contact block: address, phone, email.
 *
 * Every row here is either plain text or a same-tab `tel:`/`mailto:` link, so
 * there is no `target`/`rel` handling and no `aria-label` — the visible text is
 * the accessible name. The socials live in the identity column instead, where
 * they are icon-only and do need labels.
 *
 * Module scope because `VENUE` is a constant — nothing to recompute per render.
 */
const CONTACT_ROWS: readonly ContactRow[] = [
  {
    icon: 'pin',
    lines: [
      `${VENUE.address.street},`,
      `${VENUE.address.city}, ${VENUE.address.region}, ${VENUE.address.country} ${VENUE.address.postalCode}`,
    ],
    isAddress: true,
  },
  {
    icon: 'phone',
    lines: [VENUE.phone],
    // `tel:` needs the digits only; the display format has spaces in it.
    href: `tel:${VENUE.phone.replace(/[^+\d]/g, '')}`,
  },
  {
    // TODO: `VENUE.email` is still the `hello@example.com` placeholder, and it
    // is now printed in full in the footer where visitors will read and click
    // it. Kept visible by decision — see the TODO in content.ts.
    icon: 'mail',
    lines: [VENUE.email],
    href: `mailto:${VENUE.email}`,
  },
];

/**
 * Site footer: the venue name, the nav links, and the contact icon row.
 */
export function Footer() {
  return (
    /*
      `overflow-hidden` is not optional here. The `section { overflow-x: clip }`
      rule in globals.css that saves the other sections does not match a
      `<footer>`, so without this the bled-off botanicals would widen the page.
    */
    <footer className="relative overflow-hidden border-t border-ink/10 bg-fern-200">
      {/*
        The botanicals stay, but at a higher opacity. They are pale, low-contrast
        artwork tuned for the ivory ground; at 0.12 against a green of similar
        lightness they all but disappear.
      */}
      <LeafDecor variant="footer" opacityClassName="opacity-[0.22]" />

      {/* Both of the footer's children need lifting above the decor — doing
          only this one leaves the copyright bar underneath a leaf. */}
      {/* `py-12`, down from `py-20`. The footer lost its address block and
          newsletter form, so 80px of vertical padding above and below a 200px
          row left a band of empty green as tall as the content itself.
          `gap-10` is the stacked-column gap on mobile; the horizontal column
          gap on desktop stays at `lg:gap-12`. */}
      <div className="container-page relative z-10 grid gap-10 py-12 lg:grid-cols-[1.2fr_1fr_1fr] lg:gap-12">
        {/* Identity. The address moved out with the newsletter form — it is
            still shown under "Visit us" in the enquiry section, and the JSON-LD
            in `layout.tsx` builds its own copy from `VENUE.address`, so search
            engines and maps are unaffected by its absence here. */}
        <div className="flex flex-col items-start gap-5">
          <Reveal>
            {/*
              A real `alt`, unlike the navbar's copy of this mark. There, the
              venue name sits in a span beside the logo, so a description would
              announce it twice. Here the heading that used to do that job has
              been removed, leaving the logo as the only thing identifying this
              column — with `alt=""` it would be invisible to a screen reader
              and the block would announce as nothing at all.

              The file is an opaque JPEG: white down the left and right edges,
              green foliage across the top and bottom. Against the ivory footer
              that square edge is visible, so `rounded-xl` makes it read as a
              deliberate tile rather than an image that failed to cut out. Keep
              it modest in size for the same reason — the white flanks grow with
              it.

              `sizes` has to track the rendered box — it is the only thing
              telling the browser which variant to fetch. Left at the old 80px
              while the box grew to 128, it would pick a candidate too small and
              the mark would render visibly soft. Without it at all, next/image
              ships the 2048px, 230 KB original.
            */}
            <Image
              src="/images/logo-watermark.jpg"
              alt={VENUE.name}
              width={2048}
              height={2048}
              sizes="128px"
              className="h-32 w-32 rounded-2xl"
            />
          </Reveal>

          {/*
            The platform name sits beside each mark, so `title` is gone — a
            tooltip repeating visible text is noise.

            The `aria-label` stays, but only to add the new-tab warning, and it
            *starts with* the visible word: WCAG's "Label in Name" wants the
            accessible name to contain the visible text, so that someone saying
            "click Facebook" to a voice control actually hits this link. A label
            of "Angeles Venue on Facebook…" would not begin with what is on
            screen.

            Column, not a row: with names attached, several socials side by side
            would run out of the grid track.
          */}
          {VENUE.socials.length > 0 && (
            <Reveal delay={0.12}>
              <ul className="flex flex-col gap-3">
                {VENUE.socials.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      // noopener is the security-relevant half: without it the
                      // opened page can reach back through window.opener.
                      rel="noopener noreferrer"
                      aria-label={`${social.label} (opens in a new tab)`}
                      className="group flex items-center gap-3 text-sm text-ink transition-colors hover:text-clay-700"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink/25 transition-colors group-hover:border-clay-700/60">
                        <Icon name={social.icon} />
                      </span>
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
        </div>

        {/* Navigation */}
        <Reveal delay={0.06} as="nav" className="flex flex-col gap-4">
          {/* Labelled because this is the page's second <nav> — without it,
              screen-reader landmark lists show two undifferentiated "navigation"
              entries. */}
          {/* `font-bold` here rather than in the `.eyebrow` class itself —
              that class is shared with the section eyebrows in Services,
              Stories, About, Gallery and the enquiry form, and only the
              footer's two headings were asked for. It wins over the class's
              `font-medium` because utilities are layered after components. */}
          <h2 className="eyebrow font-bold text-clay-700" id="footer-nav-heading">
            Explore
          </h2>
          <ul aria-labelledby="footer-nav-heading" className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm uppercase tracking-wide text-ink transition-colors hover:text-clay-700"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#booking"
                className="text-sm uppercase tracking-wide text-ink transition-colors hover:text-clay-700"
              >
                {/* Title case, matching the navbar's "Book Your Event" button
                    and the other four links in this list. */}
                Book Your Event
              </a>
            </li>
          </ul>
        </Reveal>

        {/* Contact + socials */}
        <Reveal delay={0.12} className="flex flex-col gap-4">
          <h2 className="eyebrow font-bold text-clay-700" id="footer-contact-heading">
            For Inquiry
          </h2>

          {/*
            Icon in a fixed-width gutter, text beside it — so the second line of
            the address aligns under the first rather than under the pin.
            `items-start` and `mt-0.5` sit the glyph on the first line's cap
            height instead of centring it against a two-line block.

            The visible text is the accessible name on every row, so none of
            these needs an `aria-label` — adding one would override what is on
            screen. The icon-only socials under the logo are the opposite case.
          */}
          <ul
            aria-labelledby="footer-contact-heading"
            className="flex flex-col gap-4"
          >
            {CONTACT_ROWS.map((row) => {
              // `block` spans rather than <br>: the address wraps as two
              // distinct lines without adding a break element inside a link.
              const body = row.lines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ));

              return (
                <li key={row.icon} className="flex items-start gap-3">
                  <Icon
                    name={row.icon}
                    size={16}
                    className="mt-0.5 shrink-0 text-clay-700"
                  />
                  {row.href ? (
                    <a
                      href={row.href}
                      className="text-sm leading-relaxed text-ink transition-colors hover:text-clay-700"
                    >
                      {body}
                    </a>
                  ) : row.isAddress ? (
                    <address className="not-italic text-sm leading-relaxed text-ink">
                      {body}
                    </address>
                  ) : (
                    <p className="text-sm leading-relaxed text-ink">{body}</p>
                  )}
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>

      {/* The map lives in the About section now (`About.tsx`), so there is no
          second embed down here. */}
      <div className="relative z-10 border-t border-ink/10">
        <div className="container-page flex flex-col items-start justify-between gap-3 py-6 text-xs text-sage-800 sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {VENUE.name}. All rights reserved.
          </p>
          <p>
            {VENUE.address.city}, {VENUE.address.region}
          </p>
        </div>
      </div>
    </footer>
  );
}

/* The newsletter signup was removed with the address block. It was never wired
   to a mailing list provider and only reported that fact back to the visitor,
   so nothing that worked was lost.

   The brand marks live in `components/ui/Icon.tsx` — the enquiry block needs
   the Facebook one too, and a second copy of the path was the alternative. */
