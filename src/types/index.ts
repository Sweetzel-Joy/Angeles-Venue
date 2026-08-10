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

/**
 * A bookable package.
 *
 * Rates are deliberately **not** modelled here. The venue publishes inclusions
 * on the site and quotes prices on enquiry, so there is no field to put a price
 * in — which is the point: adding one later should be a conscious decision, not
 * something that slips in because the shape allowed it.
 */
export interface ServicePackage {
  id: string;
  name: string;
  /** One line describing who the package suits. */
  summary: string;
  /** Everything included, exactly as the venue lists it. */
  inclusions: readonly string[];
}

/** An extra available on request, charged separately. */
export interface ServiceAddOn {
  id: string;
  label: string;
  /** Qualifier such as "with or without cover". */
  note?: string;
}

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
  /**
   * Which masonry column this tile belongs to, on the two-column layout only.
   *
   * Declaring it turns off the automatic shortest-column balancing for the whole
   * gallery — see `useMasonryColumns`. That is deliberate: the columns are hand
   * balanced to finish level, and an algorithm that does not know about that
   * constraint cannot preserve it. Omit it and placement falls back to the
   * automatic fill.
   *
   * Ignored below 640px, where everything is one column in authoring order.
   */
  column?: 0 | 1;
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
  /** Who to ask for when calling. Shown beside the number. */
  contactPerson: string;
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
