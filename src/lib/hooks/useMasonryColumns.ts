'use client';

import { useMemo } from 'react';
import { useMediaQuery } from './useMediaQuery';
import type { GalleryItem } from '@/types';

/**
 * Splits gallery items into balanced columns.
 *
 * This exists because CSS multi-column cannot be used here. A multicol container
 * *fragments* its children, and Chromium's IntersectionObserver reports
 * incorrectly for fragmented boxes — so `whileInView` never fires, scroll
 * reveals never run, and (because the tiles stay clipped) the lazy-loaded images
 * inside them are never even requested. Hit-testing is unreliable for the same
 * reason, so clicks land on the container instead of the tile.
 *
 * Explicit flex columns have none of those problems: each column is an ordinary
 * block box, so observers, hit-testing and lazy loading all behave normally.
 *
 * Column count resolves to 3 on the server and on the first client render, then
 * corrects in an effect. That ordering is deliberate — computing it during
 * render would produce a hydration mismatch.
 */
export function useMasonryColumns(
  items: readonly GalleryItem[],
): GalleryItem[][] {
  const isSmall = useMediaQuery('(max-width: 639px)');
  const isMedium = useMediaQuery('(max-width: 1023px)');

  const columnCount = isSmall ? 1 : isMedium ? 2 : 3;

  return useMemo(() => {
    const columns: GalleryItem[][] = Array.from(
      { length: columnCount },
      () => [],
    );
    // Running height per column, in units of "aspect ratio" — since every
    // column renders at the same width, height is proportional to h/w.
    const heights = new Array<number>(columnCount).fill(0);

    for (const item of items) {
      // Place each item in whichever column is currently shortest. Greedy, but
      // deterministic: the same input always produces the same layout, so
      // server and client agree and nothing reshuffles on hydration.
      let shortest = 0;
      for (let i = 1; i < columnCount; i += 1) {
        if ((heights[i] ?? 0) < (heights[shortest] ?? 0)) shortest = i;
      }

      columns[shortest]?.push(item);
      heights[shortest] =
        (heights[shortest] ?? 0) + item.image.height / item.image.width;
    }

    return columns;
  }, [items, columnCount]);
}
