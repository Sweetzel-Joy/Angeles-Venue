import { NextResponse } from 'next/server';
import { hasErrors, sanitizeBooking, validateBooking } from '@/lib/validation';
import type { BookingEnquiry, ContactApiResponse } from '@/types';

/**
 * Booking enquiry endpoint.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  THIS DOES NOT SEND EMAIL YET. Enquiries submitted here are validated and
 *  logged to the server console, then discarded.
 *
 *  TODO: Wire up a mail provider before going live, or you will silently lose
 *  every booking enquiry. See the "Going live" section of the README — the
 *  place to add it is marked below.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Validation is re-run here against the same module the form uses. Client-side
 * checks are a convenience and can be bypassed with a single curl command, so
 * the server treats every payload as untrusted regardless of what the UI did.
 */

/** Always run on demand — nothing here is cacheable. */
export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<NextResponse<ContactApiResponse>> {
  let payload: Partial<BookingEnquiry>;

  try {
    payload = (await request.json()) as Partial<BookingEnquiry>;
  } catch {
    return NextResponse.json(
      { ok: false, message: 'We could not read that request. Please try again.' },
      { status: 400 },
    );
  }

  const sanitized = sanitizeBooking(payload);
  const errors = validateBooking(sanitized);

  if (hasErrors(errors)) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Please check the highlighted fields.',
        errors,
      },
      { status: 400 },
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // TODO: Replace this log with a real send. For example, with Resend:
  //
  //   import { Resend } from 'resend';
  //   const resend = new Resend(process.env.RESEND_API_KEY);
  //   await resend.emails.send({
  //     from: 'bookings@yourdomain.com',
  //     to: VENUE.email,
  //     replyTo: sanitized.email,
  //     subject: `Booking enquiry — ${sanitized.eventType}`,
  //     text: JSON.stringify(sanitized, null, 2),
  //   });
  //
  // Consider also adding rate limiting (e.g. Upstash) and a spam check before
  // this goes public — an unprotected public form will be found by bots.
  // ───────────────────────────────────────────────────────────────────────────
  console.info('[contact] Booking enquiry received (not yet emailed):', sanitized);

  return NextResponse.json({
    ok: true,
    message: 'Thank you — we have your enquiry and will reply within one business day.',
  });
}

/** Anything other than POST is a mistake worth reporting explicitly. */
export function GET(): NextResponse<ContactApiResponse> {
  return NextResponse.json(
    { ok: false, message: 'Method not allowed. Send booking enquiries with POST.' },
    { status: 405, headers: { Allow: 'POST' } },
  );
}
