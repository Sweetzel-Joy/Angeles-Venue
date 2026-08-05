'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { LazyHeroScene } from '@/components/3d/LazyHeroScene';
import { LinkButton } from '@/components/ui/Button';
import { ScrollIndicator } from '@/components/ui/ScrollIndicator';
import { wordChild, wordContainer } from '@/lib/animations';
import { VENUE } from '@/lib/content';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';

/**
 * Full-viewport hero.
 *
 * The parallax is the point of the section. Three layers move at different
 * rates as you scroll away: the 3D scene at ~0.3x, the headline at ~0.8x, and
 * the scroll hint faster still. That difference in rate is what the eye reads as
 * depth — matched rates would just look like the page scrolling normally.
 *
 * All three are driven from one `useScroll` progress value through
 * `useTransform`, which keeps them on the compositor. Reading `scrollY` into
 * React state instead would re-render this subtree on every scroll frame.
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
  const sceneY = useTransform(scrollYProgress, [0, 1], ['0%', prefersReducedMotion ? '0%' : '30%']);
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
      {/* Layer 1 — the 3D scene, slowest. */}
      <motion.div style={{ y: sceneY }} className="absolute inset-0 will-animate">
        <LazyHeroScene />
      </motion.div>

      {/*
        Ivory vignette between the scene and the type. Not decoration — without
        it the headline sits directly on moving geometry, and text contrast that
        changes frame to frame cannot be relied on. Stronger on small screens,
        where the model fills proportionally more of the frame and there is less
        empty background for the type to sit against.
      */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(253,251,247,0.88)_0%,rgba(253,251,247,0.6)_45%,rgba(253,251,247,0.9)_100%)] md:bg-[radial-gradient(ellipse_at_center,rgba(253,251,247,0.72)_0%,rgba(253,251,247,0.35)_45%,rgba(253,251,247,0.85)_100%)]"
      />

      {/* Layer 2 — the content, faster. */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="container-page relative z-10 flex flex-col items-center gap-8 text-center will-animate"
      >
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="eyebrow"
        >
          {VENUE.address.city} · {VENUE.address.region}
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
              <motion.span
                variants={prefersReducedMotion ? undefined : wordChild}
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
