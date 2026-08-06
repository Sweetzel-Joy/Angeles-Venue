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
  Amenity,
  EventType,
  GalleryItem,
  NavLink,
  Testimonial,
  VenueDetails,
} from '@/types';

/* -------------------------------------------------------------------------- */
/*  Venue identity                                                            */
/* -------------------------------------------------------------------------- */

export const VENUE: VenueDetails = {
  name: 'Angeles Venue',
  // TODO: Replace with the venue's tagline (3–6 words reads best in the hero).
  tagline: 'Where occasions become memory',
  // TODO: Replace with one or two sentences describing the venue.
  intro:
    'Your budget-friendly event place is right around the corner.',
  address: {
    // TODO: Replace all address fields with the real address.
    street: '123 Placeholder Street',
    city: 'Angeles City',
    region: 'Pampanga',
    postalCode: '2009',
    country: 'Philippines',
  },
  // TODO: Replace with the real booking phone number.
  phone: '+63 000 000 0000',
  // TODO: Replace with the real enquiries email address.
  email: 'hello@example.com',
  // TODO: Replace with the deployed site URL (used for Open Graph metadata).
  siteUrl: 'https://example.com',
  // TODO: Google Maps → Share → "Embed a map" → copy the src="" value here.
  //       A normal maps.google.com/... link will NOT render inside an iframe.
  mapEmbedUrl: '',
  socials: [
    // TODO: Replace each href with the real profile URL, or delete the entry.
    { label: 'Instagram', href: 'https://instagram.com/', icon: 'instagram' },
    { label: 'Facebook', href: 'https://facebook.com/', icon: 'facebook' },
    { label: 'TikTok', href: 'https://tiktok.com/', icon: 'tiktok' },
  ],
} as const;

/* -------------------------------------------------------------------------- */
/*  Navigation                                                                */
/* -------------------------------------------------------------------------- */

export const NAV_LINKS: readonly NavLink[] = [
  { label: 'About', href: '#about' },
  { label: 'Events', href: '#events' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Venue', href: '#venue' },
  { label: 'Stories', href: '#stories' },
] as const;

/* -------------------------------------------------------------------------- */
/*  About section                                                             */
/* -------------------------------------------------------------------------- */

export const ABOUT = {
  eyebrow: 'The Place',
  // TODO: Replace with a real headline for the about section.
  heading: 'One Venue, Every Occasion',
  // TODO: Replace both paragraphs with real copy about the venue.
  body: [
    'Angeles venue offers a place for your special occassions. It can accommodate 100pax.',
    'Use the second paragraph for what the space means in practice: how it adapts between event types, what the team handles for you, and why planners come back.',
  ],
  stats: [
    // TODO: Replace with two real headline figures.
    { label: 'Events hosted', value: 'TODO' },
    { label: 'Years operating', value: 'TODO' },
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
/*  Event types                                                               */
/* -------------------------------------------------------------------------- */

export const EVENT_TYPES: readonly EventType[] = [
  {
    id: 'weddings',
    title: 'Weddings',
    // TODO: Replace with real copy describing your wedding offering.
    description:
      'Ceremony and reception under one roof, with a bridal suite and a team that has run this day hundreds of times.',
    highlights: ['Ceremony + reception', 'Bridal suite', 'In-house coordination'],
    image: {
      // TODO: Replace with a real photograph from a wedding at the venue.
      src: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&h=1100&q=80',
      alt: 'Placeholder: a couple standing close together holding a large floral bouquet, backlit by warm sunlight.',
      width: 900,
      height: 1100,
    },
  },
  {
    id: 'corporate',
    title: 'Corporate',
    // TODO: Replace with real copy describing your corporate offering.
    description:
      'Conferences, launches and annual parties, with the AV rigging and breakout space to match.',
    highlights: ['Full AV + rigging', 'Breakout rooms', 'Delegate catering'],
    image: {
      // TODO: Replace with a real photograph from a corporate event.
      src: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&h=1100&q=80',
      alt: 'Placeholder: an audience seated in rows, seen from behind, facing a lit conference stage.',
      width: 900,
      height: 1100,
    },
  },
  {
    id: 'concerts',
    title: 'Concerts',
    // TODO: Replace with real copy describing your live-event offering.
    description:
      'A room tuned for live sound, with a load-in bay, house PA and a green room that artists do not complain about.',
    highlights: ['Tuned house PA', 'Direct load-in', 'Green room'],
    image: {
      // TODO: Replace with a real photograph from a live event.
      src: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=900&h=1100&q=80',
      alt: 'Placeholder: a concert crowd silhouetted against orange and magenta stage lighting, one hand raised holding a phone.',
      width: 900,
      height: 1100,
    },
  },
  {
    id: 'private',
    title: 'Private Parties',
    // TODO: Replace with real copy describing your private-hire offering.
    description:
      'Birthdays, anniversaries and debuts — the whole floor to yourselves, styled to whatever you have in mind.',
    highlights: ['Exclusive hire', 'Custom styling', 'Late licence'],
    image: {
      // TODO: Replace with a real photograph from a private event.
      src: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=900&h=1100&q=80',
      alt: 'Placeholder: a cluster of brightly coloured balloons floating against a pale ceiling.',
      width: 900,
      height: 1100,
    },
  },
] as const;

/* -------------------------------------------------------------------------- */
/*  Amenities — the animated counters                                         */
/* -------------------------------------------------------------------------- */

/**
 * TODO: Every `value` below is 0 on purpose. Replace each with the real figure.
 * Leaving them at 0 is safe (the counters render "0"); inventing numbers is not.
 */
export const AMENITIES: readonly Amenity[] = [
  {
    id: 'capacity',
    label: 'Seated guests',
    value: 0, // TODO: real seated capacity
    suffix: '',
    description: 'Banquet-style across the main hall.',
    icon: 'guests',
  },
  {
    id: 'area',
    label: 'Floor area',
    value: 0, // TODO: real floor area
    suffix: ' sqm',
    description: 'Column-free, with a 6 m ceiling.',
    icon: 'area',
  },
  {
    id: 'parking',
    label: 'Parking bays',
    value: 0, // TODO: real number of parking bays
    suffix: '',
    description: 'On-site and free for your guests.',
    icon: 'parking',
  },
  {
    id: 'stage',
    label: 'Stage width',
    value: 0, // TODO: real stage width in metres
    suffix: ' m',
    description: 'Modular deck, adjustable height.',
    icon: 'stage',
  },
  {
    id: 'catering',
    label: 'Menu options',
    value: 0, // TODO: real number of catering packages
    suffix: '',
    description: 'In-house kitchen, dietary requirements handled.',
    icon: 'catering',
  },
  {
    id: 'climate',
    label: 'Air-conditioned',
    value: 100,
    suffix: '%',
    description: 'Fully climate-controlled year round.',
    icon: 'climate',
  },
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
 * TODO: Replace all of these with real, attributable testimonials.
 * Do not publish invented quotes attributed to named people — beyond being
 * dishonest, fabricated reviews are unlawful in many jurisdictions.
 */
export const TESTIMONIALS: readonly Testimonial[] = [
  {
    id: 't1',
    quote:
      'Replace this with a real quote from a real client, kept to two or three sentences so it stays readable inside the carousel.',
    author: 'Client name',
    context: 'Event type · Month Year',
  },
  {
    id: 't2',
    quote:
      'A second real testimonial goes here. Quotes that mention a specific detail — the coordination, the timing, the food — land better than general praise.',
    author: 'Client name',
    context: 'Event type · Month Year',
  },
  {
    id: 't3',
    quote:
      'A third real testimonial goes here. Three is the minimum for the carousel to feel alive; five or six is better.',
    author: 'Client name',
    context: 'Event type · Month Year',
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
