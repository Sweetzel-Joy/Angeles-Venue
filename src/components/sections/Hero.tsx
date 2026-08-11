'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { LinkButton } from '@/components/ui/Button';
import { HeroSlideshow } from '@/components/ui/HeroSlideshow';
import { ScrollIndicator } from '@/components/ui/ScrollIndicator';
import { VENUE } from '@/lib/content';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';

/**
 * The slide whose photograph is bright enough that white copy washes out.
 *
 * Only the outline button reacts to it now. The wordmark and the tagline were
 * both flipped to ink here at one point and both were reverted — copy that
 * changes colour mid-crossfade reads as a glitch. The button is a control
 * rather than copy, so the same treatment is less jarring on it.
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
            The wordmark IS the <h1>, rather than sitting next to a hidden one.

            While the logo image was here the name existed only as pixels, so a
            visually-hidden heading had to carry it. Now it is real text, and
            duplicating it in an `sr-only` twin would announce the venue name
            twice in a row. The location follows in an `sr-only` span so the
            heading still reads "Angeles Venue — Tanza, Cavite" to a screen
            reader and to search engines, exactly as before.

            `leading-[1.35]` and the bottom padding are not slack: Great Vibes
            has deep descenders and long entry flourishes on the capitals, and
            at a tight leading the tails of the "g" and "V" get clipped by the
            line box.
          */}
          <motion.h1
            id="hero-heading"
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            /*
              White on every slide, by decision — deliberately NOT following the
              slide-aware flip that the tagline and the outline button below use.
              It was tried and rejected: the wordmark is the venue's name and
              reads as its logo, so changing colour underneath it looked like a
              glitch rather than a treatment.

              The glyph shadow is doing the legibility work alone here, and it
              cannot manufacture contrast — measured, this sits at about 1.9:1
              on the wedding slide. If that ever needs fixing, the answer is a
              light ground behind the text (the `.logo-glow` halo the monogram
              used, or a soft scrim), not a colour change.
            */
            /*
              Gradient fill: white at the top, `fern-200` at the bottom, via
              `background-clip: text` with a transparent fill.

              `drop-shadow` filters, NOT `.text-on-photo-strong`. That class
              stacks three dark `text-shadow` layers, and text-shadow renders
              *inside* the glyph when the fill is a clipped background — it
              tinted the letters brown. Measured: with the shadows on, the fill
              sampled rgb(232,222,206) top and rgb(238,226,205) bottom, i.e. no
              visible gradient at all; with them off, rgb(253,252,251) and
              rgb(235,238,221). A `filter` composites behind the finished glyph
              instead, so the gradient survives and the letters still lift off
              the photograph.

              `from-30%` holds the tops of the capitals pure white before the
              ramp begins. Without it the letters sat mid-gradient throughout
              and read as flat pale green: the ink fills most of a 1.35 line
              box, so an unshifted 0–100% ramp spans only about 40% of its
              range across the visible glyphs.

              No end stop — `to-92%` was tried and compiles to *nothing*, as it
              is not a value in Tailwind's stop scale (it would need
              `to-[92%]`). The default 100% is what actually renders.

              `px-10` is what stops the final "e" being sliced off. A clipped
              background only paints inside the element's own box, and script
              glyphs overhang their advance width — the flourishes on the "A"
              and the closing "e" fall outside it, so they simply went
              unpainted. Measured before: ink ended at x=677 against a box edge
              at 678, i.e. cut flush. The padding widens the paint area; it does
              not move the text, which is centred either way. `pb-2` does the
              same job for the descenders.
            */
            className="font-script bg-gradient-to-b from-white from-30% to-fern-200 bg-clip-text px-10 pb-2 text-[clamp(3.25rem,11vw,8rem)] font-normal leading-[1.35] text-transparent [filter:drop-shadow(0_1px_2px_rgba(43,39,33,0.5))_drop-shadow(0_3px_12px_rgba(43,39,33,0.45))]"
          >
            {VENUE.name}
            <span className="sr-only">
              {' '}
              — {VENUE.address.city}, {VENUE.address.region}
            </span>
          </motion.h1>

          {/*
            ───────────────────────────────────────────────────────────────────
            The AV monogram, parked while the wordmark above is trialled.

            To restore: delete the <motion.h1> above and uncomment this. The
            `sr-only` <h1> comes back with it — the image is `alt=""` precisely
            because that heading spoke for it, so restoring one without the
            other leaves the hero with no accessible name and no <h1> on the
            page.

            The `next/image` import at the top of this file is kept for the
            same reason: it is unused while this is parked, and removing it
            would make restoring a two-file job.

            Notes worth keeping with it:
             - The artwork has a real alpha channel (97% of source pixels fully
               transparent), so no `mix-blend-multiply` is needed and it can sit
               inside this animating wrapper.
             - It is a cropped copy of the source. The original is 2000x2000
               with the mark filling only 59% x 52% and sitting off-centre;
               uncropped it renders small, visibly off-axis, and its empty
               margin shoves the copy below it down the page.
             - The halo is measured: that inset puts the ground under every ink
               family at rgb(246-250) on all three slides. Enlarging it changes
               nothing.

            <h1 id="hero-heading" className="sr-only">
              Welcome to {VENUE.name} — {VENUE.address.city}, {VENUE.address.region}
            </h1>

            <motion.div
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative w-full max-w-[26rem]"
            >
              <div
                aria-hidden="true"
                className="logo-glow pointer-events-none absolute -inset-8 sm:-inset-12"
              />
              <Image
                src="/images/logo-monogram.png"
                alt=""
                width={1272}
                height={1126}
                priority
                sizes="(max-width: 480px) 88vw, 416px"
                className="relative h-auto w-full select-none [filter:drop-shadow(0_2px_6px_rgba(43,39,33,0.28))]"
              />
            </motion.div>
            ───────────────────────────────────────────────────────────────────
          */}

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
            //
            // `max-w-4xl` moved up with the type. The sentence is one line by
            // design — it was `max-w-2xl` at `text-lg/xl`, and raising the size
            // without widening the box wraps it to two lines, which changes the
            // hero's whole vertical rhythm and pushes the buttons into the
            // scroll hint. Measured at 1440: 812px of text in a 896px box.
            // White on every slide, like the wordmark above it. The
            // slide-aware ink flip was tried here and rejected: copy that
            // changes colour mid-crossfade draws attention to the swap rather
            // than to the sentence.
            className="mt-4 max-w-4xl text-xl leading-relaxed text-white text-on-photo-strong md:text-2xl"
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
