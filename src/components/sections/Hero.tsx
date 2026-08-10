'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useRef } from 'react';
import { LinkButton } from '@/components/ui/Button';
import { HeroSlideshow } from '@/components/ui/HeroSlideshow';
import { ScrollIndicator } from '@/components/ui/ScrollIndicator';
import { VENUE } from '@/lib/content';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';

/**
 * Full-viewport hero.
 *
 * Behind the mark, three venue photographs cycle at 60% opacity — see
 * `HeroSlideshow`. Everything above them keeps its light-ground styling.
 *
 * Two layers still move as the section scrolls away — the content block and the
 * scroll hint, at different rates, so the section departs with a bit of depth
 * rather than sliding off as one flat plane. Both are driven from a single
 * `useScroll` progress value through `useTransform`, which keeps them on the
 * compositor; reading `scrollY` into React state would re-render this subtree
 * on every scroll frame.
 */
export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    // From the section's top hitting the viewport top, to its bottom hitting
    // the viewport top — i.e. the whole time it is on the way out.
    offset: ['start start', 'end start'],
  });

  // Under reduced motion every layer collapses to a rate of 1 (no relative
  // movement at all) rather than merely a gentler one.
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', prefersReducedMotion ? '0%' : '80%']);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, prefersReducedMotion ? 1 : 0]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);


  return (
    <section
      ref={sectionRef}
      id="hero"
      aria-labelledby="hero-heading"
      // `group` drives the slideshow chevrons, which stay hidden until the hero
      // is hovered. `bg-ivory-100` matches Services (Services.tsx) and is the
      // ground the wallpaper photographs wash over; it also gives the hero a
      // boundary against About below it, which is `ivory-50`.
      className="group relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-ivory-100"
    >
      <HeroSlideshow />

      {/* `relative z-10` lifts the content clear of the wallpaper layer. Safe
          to add now — the `mix-blend-mode` that once forbade stacking contexts
          in this subtree went with the old banner. */}
      <div className="container-page relative z-10 flex flex-col items-center gap-8 text-center">
        <motion.div
          style={{ y: contentY, opacity: contentOpacity }}
          className="flex flex-col items-center gap-8 will-animate"
        >
          {/*
            The venue name exists only as pixels inside the logo, so this
            visually-hidden heading carries it as real text.

            It does three jobs: the page needs exactly one <h1>; the section's
            `aria-labelledby="hero-heading"` points at this id; and search
            engines read text, not artwork. The logo then takes `alt=""` —
            its words are already announced here, and giving the image alt text
            as well would read the venue name out twice in a row.
          */}
          <h1 id="hero-heading" className="sr-only">
            Welcome to {VENUE.name} — {VENUE.address.city}, {VENUE.address.region}
          </h1>

          {/*
            Unlike the banner this replaces, the artwork has a real alpha
            channel — 97% of the source pixels are fully transparent — so the
            ivory shows straight through and no `mix-blend-multiply` is needed.
            That matters structurally: a blend would have to be isolated from
            every stacking context above it, which is why the old banner had to
            sit *outside* this animating wrapper. With alpha it can sit inside
            and fade with everything else.

            Rendered from a cropped copy of the source. The original is
            2000x2000 with the mark filling only 59% x 52% of it and sitting
            off-centre; uncropped it would render small inside its own box,
            visibly off-axis, with the empty margin shoving the copy below it
            down the page.
          */}
          <motion.div
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-full max-w-[26rem]"
          >
            {/* Light halo, so the mark reads on every frame rather than on
                whatever the photograph happens to be. The tone is measured —
                see `.logo-glow` in globals.css. Inset negatively so it spreads
                past the artwork and has no visible edge. */}
            <div
              aria-hidden="true"
              // Measured: this inset puts the ground under every ink family at
              // rgb(246-250) on all three slides, i.e. effectively ivory and
              // identical frame to frame. Enlarging it further changes nothing.
              className="logo-glow pointer-events-none absolute -inset-8 sm:-inset-12"
            />

            <Image
              src="/images/logo-monogram.png"
              alt=""
              width={1272}
              height={1126}
              priority
              sizes="(max-width: 480px) 88vw, 416px"
              // `relative` so it paints above the halo — same positioned-vs-
              // static stacking point as the navbar band. The drop-shadow
              // follows the PNG's alpha, so it traces the letterforms instead
              // of boxing them.
              className="relative h-auto w-full select-none [filter:drop-shadow(0_2px_6px_rgba(43,39,33,0.28))]"
            />
          </motion.div>

          {/*
            Intro and address are grouped so they read as one block. The
            parent's `gap-8` would otherwise put 2rem between them, which reads
            as two unrelated statements rather than a line and its location.

            Both lines are white with `.text-on-photo`, because they sit
            directly on the slideshow photographs.

            The shadow is not decoration. All three slides are predominantly
            light — white drapes, white linens, white walls — so plain white
            text vanishes into them just as the previous grey vanished into the
            dark patches. Measured figures are in the README. Remove the shadow
            and the copy becomes unreadable on the bright half of every frame.
          */}
          <div className="flex flex-col items-center gap-3">
            <motion.p
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="max-w-xl text-base leading-relaxed text-white text-on-photo md:text-lg"
            >
              {VENUE.intro}
            </motion.p>

            {/*
              Composed from the `VENUE.address` fields rather than written out,
              so `content.ts` stays the one source of truth and the visible text
              cannot drift from the JSON-LD that layout.tsx feeds to search
              engines from those same fields.

              Postcode and country are omitted deliberately — this is the
              short, human form. `not-italic` because browsers italicise
              <address> by default.
            */}
            <motion.address
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="max-w-xl text-sm not-italic leading-relaxed text-white text-on-photo"
            >
              {VENUE.address.street}, {VENUE.address.city}, {VENUE.address.region}
            </motion.address>
          </div>

          <motion.div
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <LinkButton href="#booking" size="lg">
              Book Your Event
            </LinkButton>
            <LinkButton href="#gallery" variant="secondary" size="lg">
              See the space
            </LinkButton>
          </motion.div>
        </motion.div>
      </div>

      {/* Layer 3 — the scroll hint, fades out first. */}
      <motion.div
        style={{ opacity: hintOpacity }}
        className="absolute inset-x-0 bottom-8 z-10 flex justify-center"
      >
        <ScrollIndicator href="#about" />
      </motion.div>
    </section>
  );
}
