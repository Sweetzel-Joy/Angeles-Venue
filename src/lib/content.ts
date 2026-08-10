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
  phone: '0915 076 2666',
  contactPerson: 'Eva',
  // TODO: Replace with the real enquiries email address.
  email: 'hello@example.com',
  // TODO: Replace with the deployed site URL (used for Open Graph metadata).
  siteUrl: 'https://example.com',
  // TODO: Google Maps → Share → "Embed a map" → copy the src="" value here.
  //       A normal maps.google.com/... link will NOT render inside an iframe.
  mapEmbedUrl: '',
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
  //
  // The last line repeats the street address as prose rather than composing it
  // from `VENUE.address` above, because it also carries the Vista Mall landmark
  // and its own punctuation. That means it will NOT follow if the address is
  // corrected up there — change both.
  body: [
    "Angeles Venue is the perfect canvas for your special occasions. Designed to comfortably accommodate up to 100 guests, it offers the ideal setting for life's most meaningful celebrations — weddings, birthdays, baptisms, family reunions, corporate gatherings, and so much more.",
    "Every event deserves a space that reflects your vision. Whatever look you're going for — simple and intimate, rustic and charming, glamorous and elegant, or fun and playful — our venue serves as your blank canvas, ready to transform into the celebration space you've always imagined. From the décor to the ambiance, we help bring your theme to life so every detail feels uniquely yours.",
    '📍 Conveniently located at P1B-P4 B85 L2, Carissa Homes, Bagtas, Tanza, Cavite — just a few minutes away from Vista Mall Tanza',
  ],
  // Capacity and hours lead: they are the two facts someone weighing a booking
  // checks first. Both moved here when the Venue section was removed.
  stats: [
    { label: 'Guests', value: '100' },
    { label: 'Hours of use', value: '10' },
    { label: 'Events hosted', value: '20+' },
    { label: 'Years operating', value: '5' },
  ],
  image: {
    // Real venue photography. Served from /public, so it needs no
    // `remotePatterns` entry in next.config.mjs — that is only for remote hosts.
    src: '/images/about-pavilion.jpg',
    alt: 'The covered pavilion set for a party: round tables dressed in white linen and chair covers, a green-and-gold balloon arch beside the stone bar, and the garden visible through the open side.',
    // True dimensions of the file. It is a 2.28:1 panorama, and the About
    // frame crops it to 4:3 in CSS — see the `aspect-[4/3]` figure in
    // components/sections/About.tsx.
    width: 3089,
    height: 1356,
  },
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
 * The catering slide deliberately **shares its file with the Gallery** rather
 * than duplicating 379 KB. It has its own entry here, so pointing the hero at a
 * different photograph stays a one-line change.
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
    src: '/images/gallery-sixtieth-buffet.jpg',
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
 */
export const GALLERY: readonly GalleryItem[] = [
  {
    id: 'g1',
    caption: 'Set for a birthday, looking out to the garden',
    image: {
      src: '/images/gallery-pastel-aisle.jpg',
      alt: 'Round tables in white damask linen and chair covers line both sides of an aisle running out to the garden, with pastel balloons strung across the roof and a turquoise shade sail beyond.',
      width: 1968,
      height: 864,
    },
  },
  {
    id: 'g2',
    caption: 'The dessert corner',
    image: {
      src: '/images/gallery-pastel-dessert-corner.jpg',
      alt: 'A dessert table signed "Sweets Corner" against a stone wall, framed by a pink, blue and yellow balloon arch, with set tables in the foreground.',
      width: 3089,
      height: 1356,
    },
  },
  {
    id: 'g3',
    caption: 'A 60th, with the buffet laid out',
    image: {
      src: '/images/gallery-sixtieth-buffet.jpg',
      alt: 'The pavilion under white draped ceiling fabric, chafing dishes laid along the buffet counter and a green-and-gold balloon arch over a silver sequin backdrop.',
      width: 3089,
      height: 1356,
    },
  },
  {
    id: 'g4',
    caption: 'A christening, styled in peach and blue',
    image: {
      src: '/images/gallery-hot-air-balloon.jpg',
      alt: 'A hot-air-balloon themed backdrop in peach and cream at the end of a red carpet aisle, with tables dressed in white and navy chair sashes on either side.',
      width: 2048,
      height: 1536,
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
      'From the bottom of our hearts, we would like to thank you for celebrating our marriage with us. To the owner of the wedding venue, sobrang accommodating, sobrang bait, napaka approachable and considerate, ate Eva and to your husband, sobrang thank you. Super duper affordable price at sulit na sulit. Smooth transaction and yes legit na legit.',
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
