import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';
import { VENUE } from '@/lib/content';
import { hasErrors, sanitizeBooking, validateBooking } from '@/lib/validation';
import type { BookingEnquiry, ContactApiResponse } from '@/types';

/**
 * Booking inquiry endpoint — validates, then emails the venue.
 *
 * **It used to lie.** The previous version logged the payload to the server
 * console, discarded it, and returned `ok: true` with "we have your inquiry and
 * will reply within one business day". Visitors were told they had reached the
 * venue when nobody had received anything. That is the single worst failure
 * mode a contact form has, so the rule here is now: this route only reports
 * success when a mail server has accepted the message.
 *
 * Configuration lives entirely in environment variables (see `.env.example`).
 * Nothing is hard-coded, so switching from Gmail to a transactional provider
 * later is a config change, not a code change.
 *
 * Validation is re-run here against the same module the form uses. Client-side
 * checks are a convenience and can be bypassed with a single curl command, so
 * the server treats every payload as untrusted regardless of what the UI did.
 */

/** Always run on demand — nothing here is cacheable. */
export const dynamic = 'force-dynamic';

/** Nodemailer opens TCP sockets, which the edge runtime cannot do. */
export const runtime = 'nodejs';

/**
 * Reads SMTP settings, or returns null when they are absent.
 *
 * Returning null rather than throwing lets the handler answer with an honest
 * "we could not send this" instead of a 500 — and, critically, instead of a
 * false success.
 */
function readSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

  const port = Number(process.env.SMTP_PORT ?? 465);
  return {
    host,
    port,
    // 465 is implicit TLS; 587 upgrades with STARTTLS after connecting.
    secure: port === 465,
    auth: { user, pass },
    // Where inquiries land. Defaults to the address shown on the site, so
    // there is one obvious answer rather than two places to keep in step.
    to: process.env.CONTACT_TO ?? VENUE.email,
  };
}

/** Plain-text body. Every field, labelled, including the ones left blank. */
function formatBody(enquiry: BookingEnquiry): string {
  const rows: [string, string][] = [
    ['Name', enquiry.name],
    ['Email', enquiry.email],
    ['Phone', enquiry.phone || '—'],
    ['Event type', enquiry.eventType],
    ['Preferred date', enquiry.eventDate || '—'],
    ['Expected guests', enquiry.guests || '—'],
    ['Message', enquiry.message || '—'],
  ];
  return rows.map(([label, value]) => `${label}: ${value}`).join('\n');
}

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
      { ok: false, message: 'Please check the highlighted fields.', errors },
      { status: 400 },
    );
  }

  const smtp = readSmtpConfig();

  if (!smtp) {
    // Not configured. Say so plainly and point the visitor at a route that
    // works, rather than swallowing the inquiry behind a thank-you.
    console.error(
      '[contact] SMTP is not configured — inquiry NOT delivered. Set SMTP_HOST, SMTP_USER and SMTP_PASS. Payload:',
      sanitized,
    );
    return NextResponse.json(
      {
        ok: false,
        message: `Our form is not able to send messages right now. Please email us directly at ${VENUE.email} or call ${VENUE.phone}.`,
      },
      { status: 503 },
    );
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: smtp.auth,
    });

    await transporter.sendMail({
      // Must be the authenticated mailbox. Gmail rewrites anything else, and
      // most providers reject it outright as a spoofing attempt.
      from: `"${VENUE.name} website" <${smtp.auth.user}>`,
      to: smtp.to,
      // The reply goes to the person who filled the form, so hitting reply in
      // the inbox answers them directly rather than emailing yourself.
      replyTo: `"${sanitized.name}" <${sanitized.email}>`,
      subject: `New inquiry — ${sanitized.eventType} — ${sanitized.name}`,
      text: formatBody(sanitized),
    });
  } catch (error) {
    // Log the reason server-side; do not leak SMTP details to the browser.
    console.error('[contact] SMTP send failed:', error);
    return NextResponse.json(
      {
        ok: false,
        message: `We could not send that just now. Please email us directly at ${VENUE.email} or call ${VENUE.phone}.`,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    // Sent only after the mail server has accepted the message — see the
    // docblock. Nothing above this line reports success.
    message: 'Thank You - We will surely reply to your inquiry.',
  });
}

/** Anything other than POST is a mistake worth reporting explicitly. */
export function GET(): NextResponse<ContactApiResponse> {
  return NextResponse.json(
    { ok: false, message: 'Method not allowed. Send booking inquiries with POST.' },
    { status: 405, headers: { Allow: 'POST' } },
  );
}
