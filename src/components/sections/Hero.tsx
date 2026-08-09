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
 * Deliberately empty behind the type: no background image, no gradient, no 3D.
 * The headline is the whole composition, so it gets the whole stage.
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
        No background layer and no contrast scrims here any more. The banner
        below *is* the hero's artwork, and it sits in the content flow rather
        than behind it — so the type has plain ivory behind it and the scrims
        that used to protect it from dense foliage would now only mute the page.
      */}

      {/*
        This wrapper deliberately has **no** `z-index`, no opacity and no
        `will-change`. Any of those would make it a stacking context, and a
        stacking context isolates `mix-blend-mode` from the page background —
        which would leave the banner's white ground painting as a visible white
        panel on the ivory. It has to stay a plain box all the way up to <body>.

        That is why the scroll fade lives on an inner wrapper around the text
        instead of out here.
      */}
      <div className="container-page flex flex-col items-center gap-8 text-center">
        {/*
          The venue name and location now exist only as pixels inside the
          banner, so this visually-hidden heading carries them as real text.

          It does three jobs at once: the page needs exactly one <h1>; the
          section's `aria-labelledby="hero-heading"` points at this id; and
          search engines read text, not artwork. Remove it and the site loses
          its own name everywhere that is not a screenshot.

          The banner then takes `alt=""` deliberately — its words are already
          announced by this heading, and giving the image alt text as well
          would read the venue name out twice in a row.

          `mix-blend-multiply` because the PNG has no alpha: sampled, every
          pixel is A=255 on a pure #FFFFFF ground. Multiplying by white leaves
          the ivory untouched, so the white card disappears and only the artwork
          remains.

          The banner is therefore **deliberately not animated**. It first shipped
          inside a fading `motion.div`, and the opacity animation plus
          `will-change` created a stacking context that isolated the blend — the
          white ground came back as a visible panel, which a pixel comparison
          caught. A static image is the price of the blend working.

          Rendered at its natural 1.79 ratio rather than stretched: the hero is
          `100svh` and far taller than the artwork on a phone, so forcing it to
          cover would crop "ANGELES" off both edges.
        */}
        <h1 id="hero-heading" className="sr-only">
          Welcome to {VENUE.name} — {VENUE.address.city}, {VENUE.address.region}
        </h1>

        <Image
          src="/images/hero-banner.png"
          alt=""
          width={1080}
          height={605}
          priority
          sizes="(max-width: 768px) 100vw, 900px"
          className="h-auto w-full max-w-4xl select-none mix-blend-multiply"
        />

        {/*
          The scroll fade lives here, wrapping only the text, rather than around
          the whole hero. Its `opacity` and `will-change` make it a stacking
          context — harmless for text, fatal for the blended banner above, which
          is why the banner sits outside it.
        */}
        <motion.div
          style={{ y: contentY, opacity: contentOpacity }}
          className="flex flex-col items-center gap-8 will-animate"
        >
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
