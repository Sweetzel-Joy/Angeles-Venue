'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useMemo, useRef, useState } from 'react';
import { Counter } from '@/components/ui/Counter';
import { Lightbox } from '@/components/ui/Lightbox';
import { Reveal } from '@/components/ui/Reveal';
import { TiltCard } from '@/components/ui/TiltCard';
import { fadeInUp, slideInLeft, slideInRight } from '@/lib/animations';
import { ABOUT, VENUE } from '@/lib/content';
import { useInViewOnce } from '@/lib/hooks/useInViewOnce';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import type { GalleryItem } from '@/types';

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
  // Gates the stat counters. `useInViewOnce` disconnects after the first hit,
  // so the numbers count once and never re-run on scroll-back.
  const [statsRef, statsInView] = useInViewOnce<HTMLDListElement>({ threshold: 0.4 });

  /*
    Full-size viewer for the photograph, reusing the Gallery's `Lightbox` — it
    already handles the focus trap, focus restoration to the trigger, Escape,
    and the background scroll lock. A one-entry list: the component hides its
    paging controls when there is nothing to page to.
  */
  const [photoOpen, setPhotoOpen] = useState<number | null>(null);
  const photoItems = useMemo<GalleryItem[]>(
    () => [{ id: 'about-photo', image: ABOUT.image, caption: ABOUT.imageCaption }],
    [],
  );

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
      {/*
        `lg:items-stretch` (the grid default) rather than `center` or `start`.

        Both columns then fill the row, and the map below is `lg:flex-1`, so it
        absorbs whatever height the text column leaves — the two columns finish
        level without either being given a hard-coded height. Change the copy
        and it stays aligned.

        `items-center` was wrong once the photograph went in: the right column
        grew ~320px taller and the text block floated with ~160px of dead space
        above the eyebrow.
      */}
      <div className="container-page relative z-10 grid items-center gap-14 lg:grid-cols-2 lg:items-stretch lg:gap-20">
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
            {/*
              One observer for the whole list, passed down to every Counter, so
              the four numbers start together. Four separate observers would
              fire at slightly different moments and the row would stagger.
            */}
            {/*
              No `mt-*`: the column's own `gap-6` already separates this from
              the paragraph above, and the previous `mt-4` + `pt-8` stacked with
              it to ~72px of dead space above the numbers.
            */}
            <dl
              ref={statsRef}
              className="flex flex-wrap gap-10 border-t border-ink/10 pt-5"
            >
              {ABOUT.stats.map((stat) => (
                <div key={stat.label} className="flex flex-col gap-1">
                  <dt className="order-2 text-sm text-ink-faint">{stat.label}</dt>
                  <dd className="order-1 font-display text-4xl font-light text-clay-600">
                    <Counter value={stat.value} start={statsInView} />
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        {/* Location + map column — the map falls back to the venue photograph */}
        {/* `lg:h-full` on both wrappers so the grid cell's stretched height
            reaches the map, which claims the leftover space. Miss either one
            and the chain breaks silently — the map just keeps its own size. */}
        <Reveal variants={slideInRight} amount={0.15} className="lg:h-full">
          {/* The address sits inside the same parallax wrapper as the map, so
              the two travel together rather than drifting apart on scroll. */}
          <motion.div
            style={{ y: imageY }}
            className="flex flex-col gap-5 will-animate lg:h-full"
          >
            <p className="text-base leading-relaxed text-ink-muted">
              {ABOUT.location}
            </p>

            <VenuePhoto onOpen={() => setPhotoOpen(0)} />

            {/* The map is the only optional part of this column — the photo
                above already guarantees it is never an empty rectangle, which
                is what the old fallback existed for. */}
            {VENUE.mapEmbedUrl ? <LocationMap /> : null}
          </motion.div>
        </Reveal>
      </div>

      {/* Portals to <body>, so the section's `overflow-hidden` cannot clip it. */}
      <Lightbox
        items={photoItems}
        index={photoOpen}
        onClose={() => setPhotoOpen(null)}
        onNavigate={setPhotoOpen}
      />
    </section>
  );
}

/**
 * Embedded Google Map of the venue, in the same frame the photograph used.
 *
 * Two things this deliberately does NOT do, both of which look harmless and
 * quietly break the map:
 *
 *  - **No `TiltCard`.** It rotates the card toward the pointer. On a map, the
 *    pointer movement that pans would also tilt the frame, and hit-testing
 *    through a 3D transform is unreliable. The frame keeps the same radius,
 *    ratio and shadow — just not the tilt.
 *  - **No gradient overlay.** The photograph's warm gradient is
 *    `absolute inset-0`. Over an iframe it swallows every click, drag and
 *    scroll: the map would look perfect and be completely dead.
 */
function LocationMap() {
  return (
    /*
      From `lg` up the map fills whatever height the text column leaves, so the
      two columns finish level. `lg:aspect-auto` is required — an aspect ratio
      and `flex-1` fight, and the ratio wins.

      Below `lg` the columns stack and there is no leftover height to claim, so
      it falls back to a square. `lg:min-h-[240px]` stops it collapsing to
      nothing if the text column is ever short.
    */
    <div className="relative aspect-square overflow-hidden rounded-3xl bg-ivory-200 shadow-lift lg:aspect-auto lg:min-h-[240px] lg:flex-1">
      <iframe
        src={VENUE.mapEmbedUrl}
        title={`Map showing the location of ${VENUE.name}`}
        // Defers the third-party request until the visitor scrolls near it,
        // rather than loading Google's scripts and cookies on first paint.
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  );
}

/**
 * The venue photograph, above the map.
 *
 * `aspect-[2/1]` against a 1.773:1 file: slightly wider than the source, so
 * roughly 11% is trimmed off the top and bottom. The subject sits centrally —
 * the covered floor and the bar counter — so what goes is sky at the top and
 * paving at the bottom, neither of which carries the shot.
 *
 * It shares the map's rounded, shadowed card deliberately: the two stack as one
 * object in the column.
 */
function VenuePhoto({ onOpen }: { onOpen: () => void }) {
  return (
    <TiltCard maxTilt={8} lift={16} className="rounded-3xl">
      <figure className="relative aspect-[2/1] overflow-hidden rounded-3xl bg-ivory-200 shadow-lift">
        {/*
          The button carries the description, so the image inside takes
          `alt=""` — a non-empty alt here would announce the same text twice for
          one control. Same convention as the gallery tiles (Gallery.tsx).
        */}
        <button
          type="button"
          onClick={onOpen}
          aria-label={`View photo full size: ${ABOUT.image.alt}`}
          className="absolute inset-0 z-10 cursor-zoom-in rounded-3xl"
        />
        <Image
          src={ABOUT.image.src}
          alt=""
          fill
          sizes="(max-width: 1024px) 92vw, 45vw"
          className="object-cover"
        />
        {/* Warm gradient so the ivory page and the photo meet softly rather
            than at a hard rectangular edge. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-clay-700/25 via-transparent to-transparent"
        />
      </figure>
    </TiltCard>
  );
}
