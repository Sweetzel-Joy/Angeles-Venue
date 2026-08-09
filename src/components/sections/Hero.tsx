'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useRef } from 'react';
import { LinkButton } from '@/components/ui/Button';
import { ScrollIndicator } from '@/components/ui/ScrollIndicator';
import { VENUE } from '@/lib/content';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';

/**
 * Full-viewport hero.
 *
 * Deliberately empty behind the mark: no background image, no gradient, no 3D.
 * The logo is the whole composition, so it gets the whole stage.
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
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden"
    >
      {/*
        No background layer and no contrast scrims. The logo below sits in the
        content flow on plain ivory, so there is nothing for a scrim to protect.
      */}
      <div className="container-page flex flex-col items-center gap-8 text-center">
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
            className="w-full max-w-[26rem]"
          >
            <Image
              src="/images/logo-monogram.png"
              alt=""
              width={1272}
              height={1126}
              priority
              sizes="(max-width: 480px) 88vw, 416px"
              className="h-auto w-full select-none"
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-xl text-base leading-relaxed text-ink-muted md:text-lg"
          >
            {VENUE.intro}
          </motion.p>

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
