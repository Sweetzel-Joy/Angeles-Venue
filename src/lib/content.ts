/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  THE ONLY FILE YOU NEED TO EDIT TO PUT REAL VENUE DATA ON THE SITE.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Every `TODO:` below marks a value that is a placeholder. They are deliberately
 * obvious ("Client name", `value: 0`) rather than plausible-looking invented
 * numbers — a fake-but-realistic capacity figure is exactly the kind of thing
 * that survives to production unnoticed.
 *
 * Search this file for "TODO:" to find everything outstanding.
 * The README carries the same list as a checklist.
 */

import type {
  GalleryItem,
  NavLink,
  ServiceAddOn,
  ServicePackage,
  Testimonial,
  VenueDetails,
} from '@/types';

/* -------------------------------------------------------------------------- */
/*  Venue identity                                                            */
/* -------------------------------------------------------------------------- */

export const VENUE: VenueDetails = {
  name: 'Angeles Venue',
  // TODO: Replace with the venue's tagline (3–6 words reads best in the hero).
  tagline: 'Angeles Venue',
  // TODO: Replace with one or two sentences describing the venue.
  intro:
    'Your budget-friendly event place is right around the corner.',
  address: {
    // Barangay (Bagtas) sits on the street line because there is no separate
    // barangay field — that is where it belongs in a one-line PH address.
    street: 'P1B-P4 B85 L2 Carissa Homes, Bagtas',
    city: 'Tanza',
    // The province, not the administrative region (CALABARZON). schema.org's
    // `addressRegion` expects the province/state, and this feeds the JSON-LD.
    region: 'Cavite',
    // Supplied as the published code for Tanza, Cavite — not independently
    // verified against the lot.
    postalCode: '4108',
    country: 'Philippines',
  },
  // Taken from the venue's Google Business listing. The `tel:` links in
  // Footer.tsx and BookingCta.tsx strip the spaces themselves.
  phone: '0976 445 2528',
  // TODO: Confirm this still holds for the number above — BookingCta renders
  // "<phone> — ask for <contactPerson>", and the number changed after this was
  // written.
  contactPerson: 'Eva',
  /*
    The real enquiries address. Feeds the footer, the enquiry section's "Email
    us" row, and the JSON-LD `EventVenue.email` in layout.tsx — one value, three
    places, so it never drifts.

    It is printed in plain text on a public page, so it will be harvested by
    address-scraping bots. That is the trade for it being clickable; a contact
    form alone avoids it, but the form does not send mail yet (see
    `app/api/contact/route.ts`).
  */
  email: 'sweetzelleysico17@gmail.com',
  // TODO: Replace with the deployed site URL (used for Open Graph metadata).
  siteUrl: 'https://example.com',
  /*
    Drives the map in the About section (`About.tsx`). Blank it and that section
    falls back to the venue photograph rather than showing an empty frame.

    Three parts of this URL are load-bearing:

      cid=4637974674607620998
        The venue's Google place ID, decoded from the `data=!1s0x…:0x…` blob in
        its Maps URL — the second hex value, 0x405d6564bd3ec386, as decimal.
        This is what makes the marker resolve to the real *listing*: the pin is
        labelled "Angeles Venue", the info card shows the business and its
        address, and clicking through opens that listing. A plain lat/lng `q=`
        gives an unnamed pin at a coordinate instead.

      t=k
        Satellite imagery. Measured against the road map: mean brightness drops
        from 234 to ~120 and green cover rises from 0.9% to ~17%. `t=h` renders
        identically here — Google already draws street and place labels over the
        imagery, so there is no separate "hybrid" worth choosing.

      output=embed
        Long-standing but NOT a documented Google API, so it carries no
        compatibility promise. The supported alternative is Maps → Share →
        "Embed a map" (`.../maps/embed?pb=…`), which cannot preset satellite.
  */
  mapEmbedUrl:
    'https://maps.google.com/maps?cid=4637974674607620998&z=18&hl=en&t=k&output=embed',
  // Only accounts that actually exist. The Instagram and TikTok entries that
  // used to sit here pointed at those sites' homepages — a link that promises a
  // profile and delivers a dead end is worse than no icon at all. Add them back
  // when there are real profiles to link to.
  socials: [
    {
      label: 'Facebook',
      href: 'https://www.facebook.com/AngelesVenue',
      icon: 'facebook',
    },
  ],
} as const;

/* -------------------------------------------------------------------------- */
/*  Navigation                                                                */
/* -------------------------------------------------------------------------- */

export const NAV_LINKS: readonly NavLink[] = [
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Stories', href: '#stories' },
] as const;

/* -------------------------------------------------------------------------- */
/*  About section                                                             */
/* -------------------------------------------------------------------------- */

export const ABOUT = {
  eyebrow: 'The Place',
  // TODO: Replace with a real headline for the about section.
  heading: 'One Venue, Every Occasion',
  // Real copy, supplied by the venue. `About.tsx` maps over this array, so the
  // number of paragraphs is free — each one gets its own staggered reveal.
  body: [
    "Angeles Venue is the perfect canvas for your special occasions. Designed to comfortably accommodate up to 100 guests, it offers the ideal setting for life's most meaningful celebrations — weddings, birthdays, baptisms, family reunions, corporate gatherings, and so much more.",
    "Every event deserves a space that reflects your vision. Whatever look you're going for — simple and intimate, rustic and charming, glamorous and elegant, or fun and playful — our venue serves as your blank canvas, ready to transform into the celebration space you've always imagined. From the décor to the ambiance, we help bring your theme to life so every detail feels uniquely yours.",
  ],
  /*
    Rendered in the right-hand column directly above the map, not as a third
    body paragraph — it belongs with the thing it describes.

    Its own field rather than `body[2]`: About.tsx maps over `body`, so a named
    key keeps that mapping honest and nothing has to index the array by
    position.

    It spells the street address out as prose rather than composing it from
    `VENUE.address`, because it also carries the Vista Mall landmark and its own
    punctuation — so it will NOT follow if the address is corrected up there.
    Change both.
  */
  location:
    '📍 Conveniently located at P1B-P4 B85 L2, Carissa Homes, Bagtas, Tanza, Cavite — just a few minutes away from Vista Mall Tanza',
  // Capacity and hours lead: they are the two facts someone weighing a booking
  // checks first. Both moved here when the Venue section was removed.
  stats: [
    { label: 'Guests', value: '100' },
    { label: 'Hours of use', value: '10' },
    { label: 'Events hosted', value: '20+' },
    { label: 'Years operating', value: '3' },
  ],
  /*
    Shown in the right-hand column between the location line and the map.

    Real `alt`, not `alt=""` — this is content, not decoration. It is the space
    a visitor is deciding whether to book, so the description has to carry what
    the photograph actually shows.
  */
  image: {
    // Real venue photography. Served from /public, so it needs no
    // `remotePatterns` entry in next.config.mjs — that is only for remote hosts.
    src: '/images/about-covered-pavilion.jpg',
    alt: 'The covered event area: a wide open floor under a red-framed roof with a green shade canopy and string lights, a stone-clad bar counter carrying the Angeles Venue sign, stacked tables and chairs to one side, and greenery along the open edges.',
    // True dimensions of the file. 1.773:1, so the `aspect-[2/1]` frame in
    // About.tsx crops a little off the top and bottom.
    width: 2048,
    height: 1155,
  },
  // Shown under the photograph when it is opened full size. Deliberately short
  // — `image.alt` is a full description, which is right for alt text and far
  // too long to sit as a caption.
  imageCaption: 'The covered event area',
} as const;

/* -------------------------------------------------------------------------- */
/*  Hero wallpaper slideshow                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Photographs that cycle behind the hero.
 *
 * **Array order is display order** — wedding, then catering, then guest room.
 *
 * Rendered at 60% opacity over `ivory-100`, and they cycle every 3 seconds —
 * see `HeroSlideshow.tsx`. The hero copy is white with a glyph shadow and the
 * monogram sits on its own halo, because at this strength both would otherwise
 * be lost in the photograph. The README carries the measured figures.
 *
 * `alt` is documentation only. The rendered images carry `alt=""` because the
 * layer is decorative and the section already has its own <h1>.
 *
 * The catering slide used to share `gallery-sixtieth-buffet.jpg` with the
 * Gallery. The Gallery was replaced wholesale and no longer includes that shot,
 * so the file was renamed `hero-catering.jpg` — it is the hero's own asset now.
 * Deleting it with the rest of the old gallery set would have 404'd this slide.
 */
export const HERO_SLIDES = [
  {
    src: '/images/hero-wedding.jpg',
    alt: 'A wedding aisle set with a red carpet, white draping, crystal-hung flower stands and a floral arch at the altar.',
    // Lower resolution than the other two — see README. At this opacity the
    // upscaling is not visible; swapping in a larger file needs only these
    // numbers changed.
    width: 1080,
    height: 452,
  },
  {
    src: '/images/hero-catering.jpg',
    alt: 'Round tables dressed in white linen and chair covers under the covered pavilion, with a green-and-gold balloon arch and the buffet laid out along the bar.',
    width: 3089,
    height: 1356,
  },
  {
    src: '/images/hero-guest-room.jpg',
    alt: 'The guest room, with a single bed, a day bed, a shelving unit and a sofa.',
    width: 3089,
    height: 1356,
  },
] as const;

/* -------------------------------------------------------------------------- */
/*  Services — packages and add-ons                                           */
/* -------------------------------------------------------------------------- */

/**
 * The venue's real packages, transcribed from its rate card.
 *
 * **Rates are deliberately omitted.** The venue quotes on enquiry, so this file
 * carries inclusions only and the section links to the booking form for prices.
 * `ServicePackage` has no price field at all, so putting one back is a
 * deliberate act rather than something that creeps in.
 *
 * Setups A and B are titled "Place + Table setup" on the card, so they are
 * presented as the Place-only package *plus* their extras. Their `inclusions`
 * list only the extras; the UI states that everything in Place only is included.
 */
export const SERVICE_PACKAGES: readonly ServicePackage[] = [
  {
    id: 'place-only',
    name: 'Place only',
    summary: 'The space itself, for a party bringing its own tables and chairs.',
    inclusions: [
      'Space that can hold up to 100 people',
      '10 hours of use, 11am–9pm (flexible based on availability)',
      'Bluetooth speaker',
      'Water dispenser with 1 gallon of drinking water (cold only)',
      // Supplied separately, not on the rate card image. The comfort room and
      // lavatory are inside this room, which is why the kitchen line below no
      // longer mentions a CR — listing both would imply two of them.
      'Guest room with a bed, comfort room and lavatory',
      'Kitchen',
      'Free wifi (3 users only)',
    ],
  },
  {
    id: 'setup-a',
    name: 'Place + Table Setup A',
    summary: 'A smaller gathering, with tables and seating for thirty.',
    inclusions: [
      '4 medium or 2 large round tables',
      '1 long table',
      '30 monobloc chairs',
      'Extra gallon of drinking water (2 gallons total)',
    ],
  },
  {
    id: 'setup-b',
    name: 'Place + Table Setup B',
    summary: 'A full function, with covered tables and seating for fifty.',
    inclusions: [
      '1 centre chair',
      '2 medium round tables',
      '2 long tables with cover',
      '5 large round tables with cover',
      '50 monobloc chairs',
      'Extra gallon of drinking water (2 gallons total)',
    ],
  },
] as const;

/** Extras available on request, charged separately. */
export const SERVICE_ADDONS: readonly ServiceAddOn[] = [
  { id: 'large-table', label: 'Large round table', note: 'with cover' },
  { id: 'medium-table', label: 'Medium round table', note: 'with or without cover' },
  { id: 'chairs', label: 'Monobloc chairs', note: 'with or without cover' },
  { id: 'water', label: 'Drinking water', note: 'per gallon' },
  { id: 'pool', label: 'Portable swimming pool', note: '2 × 4 m' },
  { id: 'videoke', label: 'Videoke' },
] as const;

/* -------------------------------------------------------------------------- */
/*  Gallery                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Real venue photography, served from /public.
 *
 * Two things to preserve if you add or swap images:
 *
 *  1. `width`/`height` must be the file's true pixel dimensions. They reserve
 *     layout space before the image arrives, and `useMasonryColumns` reads the
 *     ratio to balance the columns — a wrong value produces a visibly lopsided
 *     grid, not just a little shift.
 *  2. `alt` must describe the image that is actually there. Change a `src` and
 *     leave its `alt`, and screen-reader users are told about a photograph that
 *     is not on the page.
 *
 * `caption` and `alt` are deliberately different: the caption is a short label
 * shown on hover, the alt is the full description for someone who cannot see
 * the photo.
 *
 * The first entry is rendered on its own, full width, above the grid (see
 * `Gallery.tsx`) — it is the section's lead image. Array order is now only the
 * lightbox paging order; layout is decided by `column`, not by position.
 *
 * ---
 *
 * **The two columns are hand-balanced to finish level. The numbers below are
 * load-bearing.**
 *
 * A column's height is `Σ(height/width) × columnWidth + (itemCount − 1) × 16px`
 * — the 16px being `gap-4`. So matching the columns needs the *gap counts*
 * accounted for too, not just the aspect ratios. With 11 grid tiles the counts
 * cannot be equal, so the ratio sums are deliberately unequal to cancel the odd
 * gap out:
 *
 *   column 0 — 5 tiles, Σ ratio 4.3523 → 4.3523 × 584 + 4 × 16 = 2605.7px
 *   column 1 — 6 tiles, Σ ratio 4.3250 → 4.3250 × 584 + 5 × 16 = 2605.7px
 *
 * 584px is the column width once the page hits `max-w-content` (80rem). Away
 * from that the residual is `0.0274 × W − 16`, under ~10px anywhere in the
 * two-column range, and below 640px there is only one column anyway.
 *
 * `gallery-savina-first-birthday.jpg` is the tile that was cropped to make this
 * come out exact — 2048×1387 gives it the ratio 0.6772 the equation asked for.
 * **Change any image's dimensions and the columns stop being level.** Solve for
 * a new ratio rather than eyeballing it; there is a check in
 * `scratchpad/verify` that measures the rendered columns.
 *
 * The gender reveal sitting directly under the pink backdrop is now simply a
 * matter of both declaring `column: 0` and being adjacent in this array.
 *
 * File names describe the setup rather than the child on the backdrop — these
 * become public URLs.
 */
export const GALLERY: readonly GalleryItem[] = [
  // The lead image. A 3.24:1 panorama, which is why it is featured rather than
  // dropped into a column, where it would render barely 200px tall.
  {
    id: 'g-wedding-aisle',
    caption: 'A wedding, ready for the ceremony',
    image: {
      src: '/images/gallery-wedding-aisle.jpg',
      alt: 'A wedding set up under the covered pavilion: rows of white-covered chairs either side of a red carpet aisle, tall crystal-hung stands topped with white blossom, and white drapery and floral garlands lining the walls.',
      width: 2400,
      height: 740,
    },
  },
  {
    id: 'g-christmas-party',
    caption: 'A Christmas party',
    column: 1,
    image: {
      src: '/images/gallery-christmas-party.jpg',
      alt: 'Children and their teacher gathered for a group photo in front of a Christmas party backdrop, framed by a red, green and gold balloon arch with candy-cane balloons and a decorated tree.',
      width: 1536,
      height: 2048,
    },
  },
  {
    // These two are adjacent and share a column, so the gender reveal renders
    // directly beneath the pink backdrop. Keep them together if you reorder.
    id: 'g-my-melody',
    caption: 'A pink 7th birthday backdrop',
    column: 0,
    image: {
      src: '/images/gallery-my-melody-backdrop.jpg',
      alt: 'A pink character-themed backdrop with a pastel balloon garland in lilac, yellow and peach around a white bench, a light-up letter and a character standee to one side.',
      // Cropped from the 1356×3089 original: 236px off the top and 1339px off
      // the bottom, trimming empty ceiling and most of the table foreground.
      // Full width is kept — the standee sits close to the right edge and any
      // horizontal crop clips it.
      width: 1356,
      height: 1750,
    },
  },
  {
    id: 'g-honey-gender-reveal',
    caption: 'A gender reveal',
    column: 0,
    image: {
      src: '/images/gallery-honey-gender-reveal.jpg',
      alt: 'A honey-themed gender reveal: a cream arch backdrop reading "A little honey is on the way", with a balloon garland in yellow and caramel, wooden honeycomb shapes and a dessert table of bee-decorated treats.',
      // Cropped from the 864×1968 original: 260px off the top and 368px off the
      // bottom. The original is a 1:2.28 portrait and most of that lower third
      // was bare floor.
      width: 864,
      height: 1340,
    },
  },
  {
    id: 'g-savina-first-birthday',
    caption: 'A first birthday, with the whole family',
    column: 1,
    image: {
      src: '/images/gallery-savina-first-birthday.jpg',
      alt: 'A family of thirteen gathered for a group photo in front of a pink sequin backdrop with a silver number one, under a white draped ceiling, with balloon columns either side and balloon letters spelling SAVINA on the grass platform in front.',
      // Cropped from the 2048×1536 original: 149px off the top, which was tent
      // ceiling and roof beams. The exact figure is not arbitrary — it gives
      // this tile the 0.6772 ratio that levels the two columns. See the
      // docblock above before changing it.
      width: 2048,
      height: 1387,
    },
  },
  {
    id: 'g-christening-pastel',
    caption: 'A christening and 1st birthday under a pastel balloon ceiling',
    column: 0,
    image: {
      src: '/images/gallery-christening-pastel.jpg',
      alt: 'Clusters of pastel balloons strung across the whole ceiling above round tables in pink, blue and lilac linen, with a sweets-themed backdrop of donuts and cupcakes at the far end.',
      width: 3089,
      height: 1356,
    },
  },
  {
    id: 'g-baptism-rose-hall',
    caption: 'A baptism, laid out in rose and blush',
    column: 0,
    image: {
      src: '/images/gallery-baptism-rose-hall.jpg',
      alt: 'Round tables in pale lilac damask linen facing a circular blush backdrop ringed with rose, cream and rose-gold balloons and flowers, with a dessert table and giveaway stand alongside.',
      width: 1968,
      height: 864,
    },
  },
  {
    id: 'g-sixtieth-green-gold',
    caption: 'A 60th, out to the garden',
    column: 1,
    image: {
      src: '/images/gallery-sixtieth-green-gold.jpg',
      alt: 'Round tables in white damask linen and chair covers running from the covered pavilion out under a turquoise shade sail to the garden, with a green, white and gold balloon arch over a silver sequin backdrop.',
      width: 3089,
      height: 1356,
    },
  },
  {
    id: 'g-baptism-dessert-bar',
    caption: 'A baptism laid out with a dessert bar',
    column: 1,
    image: {
      src: '/images/gallery-baptism-dessert-bar.jpg',
      alt: 'A dessert bar laid with cupcakes, cookies and doughnuts on a white table against a stone wall, between a blush balloon garland and a tiered stand of giveaway boxes.',
      width: 1968,
      height: 864,
    },
  },
  {
    id: 'g-balloon-christening',
    caption: 'A christening, styled in peach and blue',
    column: 0,
    image: {
      src: '/images/gallery-balloon-christening.jpg',
      alt: 'A hot-air-balloon themed backdrop in peach and cream at the end of a red carpet aisle, with round tables in white linen and navy chair sashes on either side.',
      width: 1852,
      height: 1172,
    },
  },
  {
    id: 'g-church-service',
    caption: 'A church service',
    column: 1,
    image: {
      src: '/images/gallery-church-service.jpg',
      alt: 'A congregation seated on white chairs under the draped ceiling, facing a speaker at a wooden lectern beside a tall wooden cross and a projector screen.',
      width: 1536,
      height: 1532,
    },
  },
  {
    id: 'g-butterfly-first-birthday',
    caption: 'A first birthday, in a butterfly garden',
    column: 1,
    image: {
      src: '/images/gallery-butterfly-first-birthday.jpg',
      alt: 'A woodland-and-butterfly backdrop framed by a blue, lilac and yellow balloon arch, with name blocks spelling VERA, a welcome sign on an easel and a rack of party giveaways alongside.',
      width: 3089,
      height: 1356,
    },
  },
] as const;

/* -------------------------------------------------------------------------- */
/*  Testimonials                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Real testimonials from real clients, supplied by the venue.
 *
 * Reproduced as written apart from clear transcription typos ("celebreating",
 * "marrage", "owener", "leigit") and stray spaces before punctuation. No word,
 * phrase or bit of Taglish has been changed, tidied or made more formal — these
 * are attributed to named people, so the voice is theirs, not ours.
 *
 * Anything added here must be a genuine, attributable quote. Fabricated reviews
 * attributed to named people are dishonest and, in many jurisdictions, unlawful.
 */
export const TESTIMONIALS: readonly Testimonial[] = [
  {
    id: 't1',
    quote:
      'Malinis at maluwag ang lugar, tsaka madaling kausap sina ate at kuya pag may request kami, nag-aadjust sila. Highly recommended po ang place na to.',
    author: 'Sweetzel',
    context: '1st Birthday · February 2025',
  },
  {
    id: 't2',
    quote:
      'To the owner of the wedding venue, sobrang accommodating, sobrang bait, napaka approachable and considerate, ate Eva and to your husband, sobrang thank you. Super duper affordable price at sulit na sulit. Smooth transaction and yes, legit na legit.',
    author: 'Mary Rose',
    context: 'Wedding · February 2024',
  },
  {
    id: 't3',
    quote:
      'Thank you po sa service nyo samin. Happy that I found a place po na budget friendly pero maayos, maaliwalas, naging maganda din po yung venue.',
    author: 'Althea',
    context: 'Christening · January 2024',
  },
] as const;

/* -------------------------------------------------------------------------- */
/*  Booking form                                                              */
/* -------------------------------------------------------------------------- */

export const EVENT_TYPE_OPTIONS: readonly string[] = [
  'Wedding',
  'Corporate event',
  'Concert / live show',
  'Private party',
  'Something else',
] as const;
