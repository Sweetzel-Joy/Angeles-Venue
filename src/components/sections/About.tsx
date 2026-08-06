'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useRef } from 'react';
import { Reveal } from '@/components/ui/Reveal';
import { TiltCard } from '@/components/ui/TiltCard';
import { fadeInUp, slideInLeft, slideInRight } from '@/lib/animations';
import { ABOUT } from '@/lib/content';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';

/**
 * Split intro section.
 *
 * The image column gets its own slow counter-scroll (`imageY`), so as the text
 * scrolls up at normal speed the photograph drifts against it. Same principle
 * as the hero: the depth cue comes from the *difference* in rate.
 */
export function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const imageY = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? ['0%', '0%'] : ['8%', '-8%'],
  );

  return (
    <section
      ref={sectionRef}
      id="about"
      aria-labelledby="about-heading"
      className="relative overflow-hidden bg-ivory-50 py-24 md:py-36"
    >
      <div className="container-page grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        {/* Text column */}
        <div className="flex flex-col gap-6">
          <Reveal variants={slideInLeft}>
            <p className="eyebrow">{ABOUT.eyebrow}</p>
          </Reveal>

          <Reveal as="h2" variants={fadeInUp} delay={0.08}>
            <span
              id="about-heading"
              className="block text-display-sm font-light text-ink md:text-display-md"
            >
              {ABOUT.heading}
            </span>
          </Reveal>

          {ABOUT.body.map((paragraph, index) => (
            <Reveal key={index} variants={fadeInUp} delay={0.16 + index * 0.08}>
              <p className="max-w-xl text-base leading-relaxed text-ink-muted">
                {paragraph}
              </p>
            </Reveal>
          ))}

          <Reveal variants={fadeInUp} delay={0.32}>
            <dl className="mt-4 flex flex-wrap gap-10 border-t border-ink/10 pt-8">
              {ABOUT.stats.map((stat) => (
                <div key={stat.label} className="flex flex-col gap-1">
                  <dt className="order-2 text-sm text-ink-faint">{stat.label}</dt>
                  <dd className="order-1 font-display text-4xl font-light text-clay-600">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        {/* Image column */}
        <Reveal variants={slideInRight} amount={0.15}>
          <motion.div style={{ y: imageY }} className="will-animate">
            <TiltCard maxTilt={8} lift={16} className="rounded-3xl">
              {/*
                The frame sets the crop, not the file. The source photograph is
                a 2.28:1 panorama; shown at its own ratio it would be a thin
                strip beside the tall text column, and cropped to the previous
                portrait frame it lost about 80% of its width — including the
                balloon arch and the garden. A 4:3 frame keeps the middle ~58%,
                which is where the composition actually lives.

                `aspect-[4/3]` + `fill` + `object-cover` mirrors the pattern in
                EventTypes.tsx rather than introducing a second way to crop.
              */}
              <figure className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-ivory-200 shadow-lift">
                <Image
                  src={ABOUT.image.src}
                  alt={ABOUT.image.alt}
                  fill
                  sizes="(max-width: 1024px) 92vw, 45vw"
                  className="object-cover"
                />
                {/* Warm gradient so the ivory page and the photo meet softly
                    rather than at a hard rectangular edge. */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-clay-700/25 via-transparent to-transparent"
                />
              </figure>
            </TiltCard>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}
