/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  THE ONLY FILE YOU NEED TO EDIT TO PUT REAL VENUE DATA ON THE SITE.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Every `TODO:` below marks a value that is a placeholder. They are deliberately
 * obvious ("Your Venue Name", `value: 0`) rather than plausible-looking invented
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
  // TODO: Replace with the venue's real trading name.
  name: 'Your Venue Name',
  // TODO: Replace with the venue's tagline (3–6 words reads best in the hero).
  tagline: 'Where occasions become memory',
  // TODO: Replace with one or two sentences describing the venue.
  intro:
    'A short description of the venue goes here — what it is, who it serves, and what makes an event held here different from one held anywhere else.',
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
  heading: 'A room that does half the work for you',
  // TODO: Replace both paragraphs with real copy about the venue.
  body: [
    'Describe the space here: its history, its architecture, the light, the scale. Two paragraphs is the sweet spot — enough to set a mood, short enough that people actually read it.',
    'Use the second paragraph for what the space means in practice: how it adapts between event types, what the team handles for you, and why planners come back.',
  ],
  stats: [
    // TODO: Replace with two real headline figures.
    { label: 'Events hosted', value: 'TODO' },
    { label: 'Years operating', value: 'TODO' },
  ],
  image: {
    // TODO: Replace with a real photograph of the venue interior.
    src: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&h=1500&q=80',
    alt: 'Placeholder: a grand ballroom set with round banquet tables and gold chairs beneath ornate chandeliers.',
    width: 1200,
    height: 1500,
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
 * TODO: Replace every image below with real venue photography.
 *
 * Two things to preserve when you swap them:
 *
 *  1. `width`/`height` must match what the URL actually returns. They reserve
 *     the space before the image arrives, so wrong values cause layout shift
 *     and throw off the masonry column balancing (which reads the ratio).
 *     The Unsplash URLs below pin both `w` and `h`, so the returned file is
 *     exactly these dimensions — no guessing.
 *  2. `alt` must describe the image that is actually there. The alt text below
 *     was written against these specific photographs; if you change the `src`
 *     and leave the `alt`, screen-reader users are told about a picture that
 *     is not on the page.
 *
 * The mix of landscape and portrait ratios is deliberate — a masonry grid
 * where every tile is 3:2 just looks like a plain grid.
 */
export const GALLERY: readonly GalleryItem[] = [
  {
    id: 'g1',
    caption: 'The main hall, set for a banquet',
    image: {
      src: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1000&h=700&q=80',
      alt: 'Placeholder: long banquet tables under a white marquee, set with linen, glassware and floral centrepieces.',
      width: 1000,
      height: 700,
    },
  },
  {
    id: 'g2',
    caption: 'The garden ceremony arch',
    image: {
      src: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1000&h=1400&q=80',
      alt: 'Placeholder: a white columned pavilion dressed with hanging flower arrangements, set up for an outdoor ceremony.',
      width: 1000,
      height: 1400,
    },
  },
  {
    id: 'g3',
    caption: 'Table styling detail',
    image: {
      src: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1000&h=1250&q=80',
      alt: 'Placeholder: a long dining table dressed in white, with small floral arrangements and glassware at each setting.',
      width: 1000,
      height: 1250,
    },
  },
  {
    id: 'g4',
    caption: 'The stage, rigged for live sound',
    image: {
      src: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1000&h=700&q=80',
      alt: 'Placeholder: a performer with one arm raised on a stage filled with smoke and red light.',
      width: 1000,
      height: 700,
    },
  },
  {
    id: 'g5',
    caption: 'Reception in full swing',
    image: {
      src: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1000&h=1200&q=80',
      alt: 'Placeholder: a crowded evening party with guests talking beneath strings of warm overhead lights.',
      width: 1000,
      height: 1200,
    },
  },
  {
    id: 'g6',
    caption: 'The hall, set for a conference',
    image: {
      src: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&h=700&q=80',
      alt: 'Placeholder: a wide conference hall with round tables and three large projection screens above the stage.',
      width: 1000,
      height: 700,
    },
  },
  {
    id: 'g7',
    caption: 'Wedding signage in the garden',
    image: {
      src: 'https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=1000&h=1300&q=80',
      alt: 'Placeholder: a wooden sign reading "Mr and Mrs" in white script, hanging among green leaves.',
      width: 1000,
      height: 1300,
    },
  },
  {
    id: 'g8',
    caption: 'The buffet, plated and ready',
    image: {
      src: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1000&h=750&q=80',
      alt: 'Placeholder: a catering buffet of hot dishes and salads in silver trays, garnished with white flowers.',
      width: 1000,
      height: 750,
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
