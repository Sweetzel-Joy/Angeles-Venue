'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useCallback, useMemo, useState } from 'react';
import { Lightbox } from '@/components/ui/Lightbox';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { clipReveal, clipRevealContainer, motionSafe } from '@/lib/animations';
import { GALLERY } from '@/lib/content';
import { useMasonryColumns } from '@/lib/hooks/useMasonryColumns';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import type { GalleryItem } from '@/types';

/**
 * Masonry gallery with a lightbox.
 *
 * Columns are real flex columns, distributed by `useMasonryColumns` — see that
 * file for why CSS multi-column is unusable here (it breaks scroll reveals,
 * lazy image loading and click targets all at once).
 *
 * The reveal animates `clip-path`, so each image is wiped in from its bottom
 * edge while the photo inside eases off a slight zoom — two rates again, so the
 * frame and its contents feel like separate objects.
 *
 * The first item is pulled out of the grid and shown full width. It is a 3.24:1
 * panorama, and in a column roughly 650px wide that renders about 200px tall —
 * technically visible, useless as the section's lead image.
 */
export function Gallery() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const feature = GALLERY[0];
  // `useMasonryColumns` memoises on `items` by identity, so the slice has to be
  // memoised here or the layout recomputes on every render. Empty deps: GALLERY
  // is a module constant. (Rest-destructuring instead would defeat this — the
  // rest array is freshly allocated on each render.)
  const gridItems = useMemo(() => GALLERY.slice(1), []);
  const columns = useMasonryColumns(gridItems);

  const handleOpen = useCallback((index: number) => setOpenIndex(index), []);
  const handleClose = useCallback(() => setOpenIndex(null), []);

  return (
    <section
      id="gallery"
      aria-labelledby="gallery-heading"
      className="relative bg-ivory-50 py-24 md:py-36"
    >
      <div className="container-page flex flex-col gap-14">
        <SectionHeading
          id="gallery-heading"
          eyebrow="The space"
          title="Moments We've Hosted"
          description="A look back at celebrations we've hosted — see how the venue comes to life for different occasions. Select any image to view it full size."
        />

        {feature && (
          <GalleryTile
            item={feature}
            index={0}
            total={GALLERY.length}
            prefersReducedMotion={prefersReducedMotion}
            onOpen={handleOpen}
            // Full-bleed within the container, so it must not inherit the
            // two-column `46vw`: the browser would pick a candidate about half
            // the width it needs and the panorama would render soft.
            sizes="92vw"
          />
        )}

        <div className="flex items-start gap-4">
          {columns.map((column, columnIndex) => (
            <div
              // Column identity is positional; there is no stable id for "the
              // second column", and the contents re-key themselves below.
              key={`column-${columnIndex}`}
              className="flex min-w-0 flex-1 flex-col gap-4"
            >
              {column.map((item) => (
                <GalleryTile
                  key={item.id}
                  item={item}
                  // Index within the *flat* list, so the lightbox pages through
                  // the gallery in authoring order rather than column order.
                  index={GALLERY.indexOf(item)}
                  total={GALLERY.length}
                  prefersReducedMotion={prefersReducedMotion}
                  onOpen={handleOpen}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <Lightbox
        items={GALLERY}
        index={openIndex}
        onClose={handleClose}
        onNavigate={setOpenIndex}
      />
    </section>
  );
}

interface GalleryTileProps {
  item: GalleryItem;
  index: number;
  total: number;
  prefersReducedMotion: boolean;
  onOpen: (index: number) => void;
  /**
   * Must describe the width this tile actually renders at. The default
   * describes a masonry column and tracks the column count in
   * `useMasonryColumns` — one column below 640px, two above. Describe more
   * columns than there are, or use it for a full-width tile, and the browser
   * picks a candidate too small, so the photo renders visibly soft.
   */
  sizes?: string;
}

function GalleryTile({
  item,
  index,
  total,
  prefersReducedMotion,
  onOpen,
  sizes = '(max-width: 640px) 92vw, 46vw',
}: GalleryTileProps) {
  return (
    <div>
      <button
        type="button"
        onClick={() => onOpen(index)}
        // The button carries the full description; the image inside is then
        // redundant to assistive tech, so it gets an empty alt.
        aria-label={`View image ${index + 1} of ${total}: ${item.image.alt}`}
        className="group relative block w-full overflow-hidden rounded-2xl bg-ivory-200"
      >
        {/*
          Two spans, not one. The outer span is what gets observed and must stay
          unclipped — `clipReveal` on a `whileInView` element clips it to zero
          area, and Chromium then reports it as never intersecting, so it would
          stay hidden permanently. The inner span carries the clip and inherits
          its animation state from the parent. See `clipRevealContainer`.

          The generous `margin` starts the reveal before the tile is actually on
          screen, which also gives the lazy image time to load: it cannot be
          requested while it is fully clipped.
        */}
        <motion.span
          className="block"
          variants={clipRevealContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.05, margin: '150px 0px 150px 0px' }}
        >
          <motion.span
            className="block will-animate"
            variants={motionSafe(clipReveal, prefersReducedMotion)}
          >
            <Image
              src={item.image.src}
              alt=""
              width={item.image.width}
              height={item.image.height}
              sizes={sizes}
              className="h-auto w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          </motion.span>
        </motion.span>

        <span
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100"
        />
        <span
          aria-hidden="true"
          className="absolute inset-x-4 bottom-4 translate-y-2 text-left text-sm text-ivory-50 opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 motion-reduce:transition-opacity"
        >
          {item.caption}
        </span>
      </button>
    </div>
  );
}
