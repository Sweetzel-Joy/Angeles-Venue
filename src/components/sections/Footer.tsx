'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FloatingLabelInput } from '@/components/ui/FloatingLabelInput';
import { Icon } from '@/components/ui/Icon';
import { LeafDecor } from '@/components/ui/LeafDecor';
import { Reveal } from '@/components/ui/Reveal';
import { NAV_LINKS, VENUE } from '@/lib/content';

/**
 * Site footer: navigation, newsletter, socials, and the map.
 */
export function Footer() {
  return (
    /*
      `overflow-hidden` is not optional here. The `section { overflow-x: clip }`
      rule in globals.css that saves the other sections does not match a
      `<footer>`, so without this the bled-off botanicals would widen the page.
    */
    <footer className="relative overflow-hidden border-t border-ink/10 bg-ivory-100">
      <LeafDecor variant="footer" opacityClassName="opacity-[0.12]" />

      {/* Both of the footer's children need lifting above the decor — doing
          only this one leaves the copyright bar underneath a leaf. */}
      <div className="container-page relative z-10 grid gap-14 py-20 lg:grid-cols-[1.2fr_1fr_1fr] lg:gap-12">
        {/* Identity + newsletter */}
        <div className="flex flex-col gap-6">
          <Reveal>
            <p className="font-display text-2xl font-light text-ink">{VENUE.name}</p>
          </Reveal>

          <Reveal delay={0.06}>
            <address className="not-italic text-sm leading-relaxed text-ink-muted">
              {VENUE.address.street}
              <br />
              {VENUE.address.city}, {VENUE.address.region} {VENUE.address.postalCode}
              <br />
              {VENUE.address.country}
            </address>
          </Reveal>

          <Reveal delay={0.12}>
            <NewsletterForm />
          </Reveal>
        </div>

        {/* Navigation */}
        <Reveal delay={0.06} as="nav" className="flex flex-col gap-4">
          {/* Labelled because this is the page's second <nav> — without it,
              screen-reader landmark lists show two undifferentiated "navigation"
              entries. */}
          <h2 className="eyebrow" id="footer-nav-heading">
            Explore
          </h2>
          <ul aria-labelledby="footer-nav-heading" className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm text-ink-muted transition-colors hover:text-clay-600"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#booking"
                className="text-sm text-ink-muted transition-colors hover:text-clay-600"
              >
                Book your event
              </a>
            </li>
          </ul>
        </Reveal>

        {/* Contact + socials */}
        <Reveal delay={0.12} className="flex flex-col gap-4">
          <h2 className="eyebrow">Get in touch</h2>
          <a
            href={`tel:${VENUE.phone.replace(/[^+\d]/g, '')}`}
            className="text-sm text-ink-muted transition-colors hover:text-clay-600"
          >
            {VENUE.phone}
          </a>
          <a
            href={`mailto:${VENUE.email}`}
            className="text-sm text-ink-muted transition-colors hover:text-clay-600"
          >
            {VENUE.email}
          </a>

          <ul className="mt-2 flex items-center gap-3">
            {VENUE.socials.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  // noopener is the security-relevant half: without it the opened
                  // page can reach back through window.opener.
                  rel="noopener noreferrer"
                  aria-label={`${VENUE.name} on ${social.label} (opens in a new tab)`}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 text-ink-muted transition-colors hover:border-clay-500/50 hover:text-clay-600"
                >
                  <Icon name={social.icon} />
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      {/* The map lives in the About section now (`About.tsx`), so there is no
          second embed down here. */}
      <div className="relative z-10 border-t border-ink/10">
        <div className="container-page flex flex-col items-start justify-between gap-3 py-6 text-xs text-ink-faint sm:flex-row sm:items-center">
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

/**
 * Newsletter signup.
 *
 * TODO: This is not wired to a mailing list provider. Point `handleSubmit` at
 * Mailchimp / Buttondown / your provider of choice, or remove the form — a
 * signup box that silently discards addresses is worse than none at all.
 */
function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        // Honest placeholder: says plainly that nothing was stored, rather than
        // showing a fake "You're subscribed!" confirmation.
        setMessage('Newsletter signup is not connected yet — see the README.');
      }}
      className="flex flex-col gap-3"
    >
      {/* A heading, not a <label> — FloatingLabelInput already supplies the
          input's real label, and a second one bound to the same id would
          concatenate into "Newsletter Email address" as the accessible name. */}
      <p className="eyebrow">Newsletter</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <FloatingLabelInput
          id="newsletter-email"
          label="Email address"
          type="email"
          name="newsletterEmail"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="flex-1"
        />
        <Button type="submit" variant="secondary" className="sm:self-start sm:py-3.5">
          Join
        </Button>
      </div>
      <p role="status" aria-live="polite" className="min-h-[1rem] text-xs text-ink-faint">
        {message}
      </p>
    </form>
  );
}

/* The brand marks moved to `components/ui/Icon.tsx` — the enquiry block needs
   the Facebook one too, and a second copy of the path was the alternative. */
