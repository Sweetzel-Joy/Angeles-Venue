import type { BookingEnquiry, BookingFieldErrors } from '@/types';

/**
 * Booking-form validation, shared between the client form and the API route.
 *
 * Deliberately one module used by both sides. Client-side validation is a
 * convenience — it gives immediate feedback and saves a round trip — but it is
 * trivially bypassed, so the server must re-run the same checks. Sharing the
 * implementation is what keeps the two from drifting into disagreeing about
 * what counts as valid.
 *
 * No zod: seven fields with simple rules do not justify the dependency, and the
 * types are already declared in `@/types`.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Digits, spaces, and the usual separators. Deliberately permissive — phone
// formats vary enormously, and rejecting a real number is far worse than
// accepting a malformed one for a form a human will read.
const PHONE_PATTERN = /^[+()\d][\d\s\-().]{5,24}$/;

const MAX_LENGTHS: Record<keyof BookingEnquiry, number> = {
  name: 120,
  email: 200,
  phone: 32,
  eventType: 64,
  eventDate: 32,
  guests: 12,
  message: 2000,
};

export function validateBooking(input: Partial<BookingEnquiry>): BookingFieldErrors {
  const errors: BookingFieldErrors = {};

  const name = input.name?.trim() ?? '';
  if (name.length < 2) {
    errors.name = 'Please tell us your name.';
  } else if (name.length > MAX_LENGTHS.name) {
    errors.name = 'That name is too long.';
  }

  const email = input.email?.trim() ?? '';
  if (!email) {
    errors.email = 'We need an email address to reply to.';
  } else if (!EMAIL_PATTERN.test(email) || email.length > MAX_LENGTHS.email) {
    errors.email = 'That does not look like a valid email address.';
  }

  // Optional — but if given, it has to be plausible.
  const phone = input.phone?.trim() ?? '';
  if (phone && !PHONE_PATTERN.test(phone)) {
    errors.phone = 'Please check this phone number.';
  }

  if (!input.eventType?.trim()) {
    errors.eventType = 'Let us know what kind of event this is.';
  }

  const eventDate = input.eventDate?.trim() ?? '';
  if (eventDate) {
    const parsed = new Date(eventDate);
    if (Number.isNaN(parsed.getTime())) {
      errors.eventDate = 'Please choose a valid date.';
    } else {
      // Compare date-only, so an enquiry made today for today is accepted.
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (parsed < today) {
        errors.eventDate = 'Please choose a date in the future.';
      }
    }
  }

  const guests = input.guests?.trim() ?? '';
  if (guests) {
    const count = Number(guests);
    if (!Number.isFinite(count) || count < 1) {
      errors.guests = 'Please enter a number of guests.';
    } else if (count > 100_000) {
      errors.guests = 'Please contact us directly for an event this size.';
    }
  }

  const message = input.message?.trim() ?? '';
  if (message.length > MAX_LENGTHS.message) {
    errors.message = 'Please keep this under 2000 characters.';
  }

  return errors;
}

export function hasErrors(errors: BookingFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * Trims and length-caps every field.
 *
 * Applied on the server before anything is logged or emailed. Capping length at
 * the boundary means an oversized payload cannot reach the mail template even
 * if validation is somehow bypassed.
 */
export function sanitizeBooking(input: Partial<BookingEnquiry>): BookingEnquiry {
  const clean = (
    value: string | undefined,
    field: keyof BookingEnquiry,
  ): string => (value ?? '').trim().slice(0, MAX_LENGTHS[field]);

  return {
    name: clean(input.name, 'name'),
    email: clean(input.email, 'email'),
    phone: clean(input.phone, 'phone'),
    eventType: clean(input.eventType, 'eventType'),
    eventDate: clean(input.eventDate, 'eventDate'),
    guests: clean(input.guests, 'guests'),
    message: clean(input.message, 'message'),
  };
}
