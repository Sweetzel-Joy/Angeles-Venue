'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { LinkButton } from '@/components/ui/Button';
import { HeroSlideshow } from '@/components/ui/HeroSlideshow';
import { ScrollIndicator } from '@/components/ui/ScrollIndicator';
import { VENUE } from '@/lib/content';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/utils';

/**
 * The slide whose photograph is bright enough that white copy washes out, so
 * the tagline and the outline button flip to ink on it.
 *
 * An index rather than a flag on the slide data: `HERO_SLIDES` describes the
 * images, and which of them needs dark copy is a fact about this layout, not
 * about the file. Reorder the slides and this must move with them.
 */
const DARK_COPY_SLIDE = 1;

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
  // `setSlideIndex` is passed straight to the slideshow: setState identities are
  // stable, so it will not re-fire the effect that reports the index.
  const [slideIndex, setSlideIndex] = useState(0);
  const darkCopy = slideIndex === DARK_COPY_SLIDE;

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
      // Bottom padding reserves room for the scroll hint. The content is
      // centred with `items-center`, so this shrinks the box it centres in and
      // lifts the block — without any, the buttons and the hint collide on
      // shorter windows (measured: -38px at 1440x700, -4px at 1024x768).
      //
      // `pb-16` rather than `pb-24`: the larger value lifted the logo close to
      // the navbar. Half the difference comes back as 16px of downward shift.
      //
      // Applied ONLY above 780px, matching the hint's own threshold. Below it
      // the hint is hidden, so the padding reserves space for something that is
      // not there — and measured, that lift pushed the logo *under* the fixed
      // navbar (-22px at 1440x700, -14px at 390x750). Where the hint is gone
      // the content should use the whole viewport.
      className="group relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-ivory-100 [@media(min-height:781px)]:pb-16"
    >
      <HeroSlideshow onSlideChange={setSlideIndex} />

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
            White with `.text-on-photo-strong`, because it sits directly on the
            slideshow photographs.

            The shadow is not decoration. All three slides are predominantly
            light — white drapes, white linens, white walls — so plain white
            text vanishes into them just as the previous grey vanished into the
            dark patches. This is the heavier of the two variants: it is the
            largest body copy on the page and has no dark band behind it, unlike
            the navbar. Measured figures are in the README.

            The address line that used to sit under this was removed on request.
            The venue's location is still carried by the `sr-only` <h1> above,
            the About section, the footer and the JSON-LD — so nothing was lost
            for search engines or screen readers.
          */}
          <motion.p
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            // `mt-4` stacks on the column's `gap-8`, so the space above this
            // grows to 48px without altering the gap to the buttons below.
            // `max-w-2xl` rather than `xl`: at this size the sentence no longer
            // fits 36rem and would silently wrap to two lines, changing the
            // hero's whole vertical rhythm.
            className={cn(
              'mt-4 max-w-2xl text-lg leading-relaxed transition-colors duration-500 md:text-xl',
              // Colour AND shadow flip together. Keeping the ink-coloured
              // shadow under dark text would ring the letters in more dark and
              // read as a smudge, not a lift.
              darkCopy
                ? 'text-on-photo-light text-ink'
                : 'text-on-photo-strong text-white',
            )}
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
            {/* Never `secondary` — that is the ivory-section treatment and is
                barely legible on a photograph. Which of the two on-photo
                variants applies depends on the slide underneath. */}
            <LinkButton
              href="#gallery"
              variant={darkCopy ? 'onPhotoDark' : 'onPhoto'}
              size="lg"
            >
              See the space
            </LinkButton>
          </motion.div>
        </motion.div>
      </div>

      {/* Layer 3 — the scroll hint, fades out first. */}
      <motion.div
        style={{ opacity: hintOpacity }}
        /*
          Hidden at 780px of viewport height and below. Padding alone cannot
          save this on a short window — at 390x667 the logo, tagline and two
          buttons need the whole screen, and lifting them far enough to clear
          the hint would wreck the composition on every normal viewport.
          Dropping a decorative hint is the cheaper loss; the section still
          scrolls.

          The threshold rose from 740 to 780 when the section's padding was
          reduced to sit the content lower: less lift means less clearance, so
          the height at which the hint stops fitting goes up with it. The two
          numbers move together — there is a sweep in `scratchpad/verify`.
        */
        className="absolute inset-x-0 bottom-8 z-10 flex justify-center [@media(max-height:780px)]:hidden"
      >
        <ScrollIndicator href="#about" />
      </motion.div>
    </section>
  );
}
