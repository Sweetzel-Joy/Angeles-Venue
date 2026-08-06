'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useCallback, useState } from 'react';
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
 */
export function Gallery() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const columns = useMasonryColumns(GALLERY);

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
          title="Look around before you visit"
          description="A cross-section of what the rooms look like set up. Select any image to view it full size."
        />

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
}

function GalleryTile({
  item,
  index,
  total,
  prefersReducedMotion,
  onOpen,
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
              // Must track the column count in `useMasonryColumns`: one column
              // below 640px, two above. Leave this describing more columns than
              // there are and the browser picks a candidate too small for the
              // tile, so the photo renders visibly soft.
              sizes="(max-width: 640px) 92vw, 46vw"
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
