/**
 * Shared domain + component types.
 *
 * Everything the page renders is driven by `src/lib/content.ts`, and these
 * interfaces are the contract for that file. Adding a field here surfaces a
 * type error at every content entry that hasn't been updated — which is the
 * point: it makes incomplete content impossible to ship silently.
 */

/** A remote or local image plus everything `next/image` needs to avoid CLS. */
export interface VenueImage {
  src: string;
  /** Describe the image for someone who cannot see it. Never leave empty. */
  alt: string;
  width: number;
  height: number;
  /** Optional tiny base64 LQIP. Falls back to a flat ivory shimmer. */
  blurDataURL?: string;
}

export interface NavLink {
  label: string;
  /** In-page anchor, e.g. `#about`. */
  href: string;
}

export interface SocialLink {
  label: string;
  href: string;
  icon: SocialIconName;
}

export type SocialIconName = 'instagram' | 'facebook' | 'tiktok' | 'youtube';

export interface EventType {
  id: string;
  title: string;
  description: string;
  /** Short capability list shown under the description. */
  highlights: readonly string[];
  image: VenueImage;
}

export interface Amenity {
  id: string;
  label: string;
  /** The number the counter animates to. */
  value: number;
  /** Rendered after the number, e.g. `"+"` or `" sqm"`. */
  suffix?: string;
  /** Rendered before the number, e.g. `"₱"`. */
  prefix?: string;
  description: string;
  icon: AmenityIconName;
}

export type AmenityIconName =
  | 'guests'
  | 'area'
  | 'parking'
  | 'stage'
  | 'catering'
  | 'climate';

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  /** e.g. "Wedding · March 2025". Keep it short — it sits under the name. */
  context: string;
}

export interface GalleryItem {
  id: string;
  image: VenueImage;
  caption: string;
}

export interface VenueDetails {
  name: string;
  tagline: string;
  /** One or two sentences. Used in the hero sub-headline and metadata. */
  intro: string;
  address: {
    street: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  };
  phone: string;
  email: string;
  /** Absolute URL of the deployed site — required for OG metadata. */
  siteUrl: string;
  /**
   * Google Maps *embed* URL (Share → Embed a map → copy the `src` value).
   * A normal maps.google.com link will not render in an iframe.
   */
  mapEmbedUrl: string;
  socials: readonly SocialLink[];
}

/** Payload accepted by `POST /api/contact`. */
export interface BookingEnquiry {
  name: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  guests: string;
  message: string;
}

export type BookingFieldErrors = Partial<Record<keyof BookingEnquiry, string>>;

export interface ContactApiResponse {
  ok: boolean;
  message: string;
  errors?: BookingFieldErrors;
}
