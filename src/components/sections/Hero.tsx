'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useRef } from 'react';
import { LinkButton } from '@/components/ui/Button';
import { ScrollIndicator } from '@/components/ui/ScrollIndicator';
import { motionSafe, wordChild, wordContainer } from '@/lib/animations';
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

  const headlineWords = VENUE.tagline.split(' ');

  return (
    <section
      ref={sectionRef}
      id="hero"
      aria-labelledby="hero-heading"
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden"
    >
      {/*
        Brand watermark.

        The source file is a JPG with a solid white background, so opacity alone
        would leave a pale square floating over the ivory page. `mix-blend-multiply`
        solves it properly: multiplying by white leaves the backdrop untouched, so
        the white disappears, while the greens and pinks darken through. That also
        avoids the halos a white-key would leave on this artwork's soft edges.

        The blend only reaches the page background while nothing between here and
        the body creates a stacking context — the section is `relative` with no
        z-index or transform, which is fine. Adding a transform to the section
        later would silently flatten this against nothing and bring the white box
        back.

        Opacity rides the existing `contentOpacity` so the watermark leaves with
        the headline instead of lingering after the text has faded. Reusing that
        value means no new motion machinery and no new reduced-motion branch.
      */}
      <motion.div
        aria-hidden="true"
        style={{ opacity: contentOpacity }}
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <Image
          src="/images/logo-watermark.jpg"
          alt=""
          width={2048}
          height={2048}
          priority
          sizes="(max-width: 768px) 85vw, 620px"
          // The artwork is drawn to the edges of its square, so showing it as a
          // floating panel leaves the leaves and grass ending in hard straight
          // cuts mid-page. The radial mask fades the outer ring so the motif
          // dissolves into the ivory instead of stopping at a rectangle.
          // `-webkit-` prefix included: Safari still needs it for mask-image.
          className="h-auto w-[min(85vw,620px)] select-none opacity-[0.10] mix-blend-multiply [-webkit-mask-image:radial-gradient(ellipse_at_center,#000_55%,transparent_82%)] [mask-image:radial-gradient(ellipse_at_center,#000_55%,transparent_82%)]"
        />
      </motion.div>

      {/* The content, which is the whole composition. */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="container-page relative z-10 flex flex-col items-center gap-8 text-center will-animate"
      >
        {/*
          Location line. Carries the full street address, so it is roughly twice
          the length of a typical eyebrow label — hence the tighter tracking and
          the width cap, which let it wrap to two centred lines on a phone
          instead of forcing the page wider.

          A <p>, not an <address>: the footer and booking section already provide
          proper <address> elements, and a third would attach contact-info
          semantics to the whole hero for no benefit.

          `initial.y` is read from `prefersReducedMotion` rather than swapping
          animation configs. Both `initial` and `animate` always name `opacity`
          and `y`, so neither can be stranded the way the headline's variants
          were when the reduced-motion flag flipped after mount.
        */}
        <motion.p
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="eyebrow max-w-xl text-balance tracking-[0.16em] sm:tracking-eyebrow"
        >
          {VENUE.address.street}, {VENUE.address.city}, {VENUE.address.region}
        </motion.p>

        {/*
          Per-word stagger. The words are wrapped in an overflow-hidden span so
          each one rises out of a mask rather than simply fading — but the
          heading text itself is unbroken in the accessibility tree, so screen
          readers announce one sentence, not a list of words.
        */}
        <motion.h1
          id="hero-heading"
          variants={wordContainer}
          initial="hidden"
          animate="visible"
          className="max-w-4xl text-display-md font-light leading-[1.02] text-ink md:text-display-lg"
        >
          {headlineWords.map((word, index) => (
            <span
              key={`${word}-${index}`}
              className="inline-block overflow-hidden pb-[0.08em] align-bottom"
            >
              {/*
                `motionSafe`, not `prefersReducedMotion ? undefined : wordChild`.
                Passing `undefined` looks like the obvious way to opt out, and it
                silently breaks: `usePrefersReducedMotion` returns false on the
                server and the first client render, so the span mounts with
                `wordChild`, takes `initial="hidden"` (opacity 0), and then — when
                the effect flips the flag — loses the variants that defined its
                `visible` state. Framer has nothing left to animate to, so the
                word stays invisible forever. A reduced variant set is needed
                here, not the absence of one.
              */}
              <motion.span
                variants={motionSafe(wordChild, prefersReducedMotion)}
                className="inline-block will-animate"
              >
                {word}
                {index < headlineWords.length - 1 && ' '}
              </motion.span>
            </span>
          ))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="max-w-xl text-base leading-relaxed text-ink-muted md:text-lg"
        >
          {VENUE.intro}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
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
