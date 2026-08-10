'use client';

import { useMemo } from 'react';
import { useMediaQuery } from './useMediaQuery';
import type { GalleryItem } from '@/types';

/**
 * Splits gallery items into columns — hand-assigned if they declare a column,
 * otherwise balanced automatically.
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
 * Column count resolves to the desktop value on the server and on the first
 * client render, then corrects in an effect. That ordering is deliberate —
 * computing it during render would produce a hydration mismatch.
 */
export function useMasonryColumns(
  items: readonly GalleryItem[],
): GalleryItem[][] {
  const isSmall = useMediaQuery('(max-width: 639px)');

  // Two columns above the small breakpoint, not three.
  //
  // The gallery photographs are panoramic — most are around 2.28:1. Split three
  // ways on a desktop viewport, each column is ~380px wide, so a panorama
  // renders barely 170px tall: a row of stunted strips you cannot actually see
  // anything in. Two columns give each image ~650px, which is enough for the
  // room to read. Worth revisiting if the gallery ever fills up with portrait
  // shots, where three columns would suit better.
  const columnCount = isSmall ? 1 : 2;

  return useMemo(() => {
    const columns: GalleryItem[][] = Array.from(
      { length: columnCount },
      () => [],
    );

    /*
      Hand-assigned placement wins over balancing, when every item asks for it.

      The automatic fill below optimises for one thing — the shortest column —
      and the gallery now has constraints it cannot express: the columns are
      tuned to finish exactly level (which depends on the *item counts* as well
      as the ratios, because each column carries `n - 1` gaps), and two specific
      photographs have to sit one above the other. Balancing would undo both.

      All or nothing on purpose. A mix of assigned and balanced items reads as
      if it should work and quietly does not: the balancer cannot see the
      assigned tiles' heights, so it fills against a running total that is not
      the real column height.
    */
    if (columnCount > 1 && items.length > 0 && items.every((i) => i.column !== undefined)) {
      for (const item of items) {
        // `?? 0` keeps an out-of-range column from dropping the tile silently.
        columns[Math.min(item.column ?? 0, columnCount - 1)]?.push(item);
      }
      return columns;
    }

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
