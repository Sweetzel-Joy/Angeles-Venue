'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import {
  FloatingLabelInput,
  FloatingLabelSelect,
  FloatingLabelTextarea,
} from '@/components/ui/FloatingLabelInput';
import { Icon } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { fadeInUp, slideInRight } from '@/lib/animations';
import { EVENT_TYPE_OPTIONS, VENUE } from '@/lib/content';
import { hasErrors, validateBooking } from '@/lib/validation';
import type { BookingEnquiry, BookingFieldErrors, ContactApiResponse } from '@/types';

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

/** Module scope: `VENUE` is a constant, so there is nothing to recompute. */
const facebook = VENUE.socials.find((social) => social.icon === 'facebook');

const EMPTY_FORM: BookingEnquiry = {
  name: '',
  email: '',
  phone: '',
  eventType: '',
  eventDate: '',
  guests: '',
  message: '',
};

/**
 * Booking enquiry form.
 *
 * Validation timing is the detail worth noting. Fields are *not* validated as
 * you type them for the first time — validating a half-typed email and showing
 * "invalid email address" after two characters is the single most irritating
 * form behaviour there is. Instead:
 *
 *   - first validation happens on submit;
 *   - after that, a field that has an error re-validates on change, so the
 *     error clears the moment it is fixed rather than on the next submit.
 *
 * On failure focus moves to the first invalid field, so keyboard users are not
 * left hunting for what went wrong.
 */
export function BookingCta() {
  const [values, setValues] = useState<BookingEnquiry>(EMPTY_FORM);
  const [errors, setErrors] = useState<BookingFieldErrors>({});
  const [state, setState] = useState<SubmitState>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const hasSubmitted = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

  const update = useCallback(
    (field: keyof BookingEnquiry) =>
      (
        event: React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
      ) => {
        const { value } = event.target;
        setValues((current) => {
          const next = { ...current, [field]: value };

          // Only re-validate live once the form has been submitted at least
          // once — see the note above about validating as you type.
          if (hasSubmitted.current) {
            setErrors(validateBooking(next));
          }
          return next;
        });
      },
    [],
  );

  const focusFirstError = useCallback((fieldErrors: BookingFieldErrors) => {
    const firstField = Object.keys(fieldErrors)[0];
    if (!firstField) return;
    formRef.current
      ?.querySelector<HTMLElement>(`[name="${firstField}"]`)
      ?.focus();
  }, []);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      hasSubmitted.current = true;

      const clientErrors = validateBooking(values);
      setErrors(clientErrors);

      if (hasErrors(clientErrors)) {
        setState('error');
        setStatusMessage('Please check the highlighted fields.');
        focusFirstError(clientErrors);
        return;
      }

      setState('submitting');
      setStatusMessage('');

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        const data = (await response.json()) as ContactApiResponse;

        if (!response.ok || !data.ok) {
          // The server re-validates, so it may reject something the client let
          // through. Surface its field errors rather than a generic failure.
          if (data.errors) {
            setErrors(data.errors);
            focusFirstError(data.errors);
          }
          setState('error');
          setStatusMessage(data.message || 'Something went wrong. Please try again.');
          return;
        }

        setState('success');
        setStatusMessage(data.message);
        setValues(EMPTY_FORM);
        setErrors({});
        hasSubmitted.current = false;
      } catch {
        setState('error');
        setStatusMessage(
          'We could not reach the server. Please try again, or email us directly.',
        );
      }
    },
    [values, focusFirstError],
  );

  const isSubmitting = state === 'submitting';

  return (
    <section
      id="booking"
      aria-labelledby="booking-heading"
      // `relative` is kept for the inner container's stacking, but the section
      // no longer needs `overflow-hidden`: that existed to clip the ambient 3D
      // shapes that used to drift behind this form.
      className="relative bg-ivory-50 py-24 md:py-36"
    >
      <div className="container-page relative grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div className="flex flex-col gap-8">
          <SectionHeading
            id="booking-heading"
            eyebrow="Inquire"
            title="Tell us about your event"
            description="Share the details of your day and we'll follow up with availability, pricing, and a floor plan."
          />

          <Reveal variants={fadeInUp} delay={0.2}>
            {/*
              Each icon sits INSIDE its `<dt>`, not beside it. A `<dl>` may wrap
              its pairs in `<div>`s, but those may contain only `<dt>` and
              `<dd>` — an `<svg>` as a third child is invalid markup that no
              browser complains about.

              They are decorative (`aria-hidden` inside `Icon`): each one is
              next to a visible label, so announcing it would give "graphic,
              Call us" instead of "Call us".
            */}
            <dl className="flex flex-col gap-5 border-t border-ink/10 pt-8 text-sm">
              <div className="flex flex-col gap-1">
                <dt className="flex items-center gap-2 text-ink-faint">
                  <Icon name="phone" size={16} className="shrink-0" />
                  Call us
                </dt>
                <dd>
                  <a
                    href={`tel:${VENUE.phone.replace(/[^+\d]/g, '')}`}
                    className="text-ink transition-colors hover:text-clay-600"
                  >
                    {VENUE.phone}
                  </a>
                  {/* Named contact, so a caller knows who to ask for rather
                      than opening with "is this the venue?". */}
                  <span className="text-ink-faint">
                    {' '}
                    — ask for {VENUE.contactPerson}
                  </span>
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="flex items-center gap-2 text-ink-faint">
                  <Icon name="mail" size={16} className="shrink-0" />
                  Email us
                </dt>
                <dd>
                  <a
                    href={`mailto:${VENUE.email}`}
                    className="text-ink transition-colors hover:text-clay-600"
                  >
                    {VENUE.email}
                  </a>
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="flex items-center gap-2 text-ink-faint">
                  <Icon name="pin" size={16} className="shrink-0" />
                  Visit us
                </dt>
                <dd className="not-italic text-ink">
                  <address className="not-italic">
                    {VENUE.address.street}
                    <br />
                    {VENUE.address.city}, {VENUE.address.region}{' '}
                    {VENUE.address.postalCode}
                  </address>
                </dd>
              </div>

              {/* Sourced from VENUE.socials rather than a second copy of the
                  URL, and skipped entirely if that entry is ever removed —
                  better no row than one pointing at nothing. */}
              {facebook && (
                <div className="flex flex-col gap-1">
                  <dt className="flex items-center gap-2 text-ink-faint">
                    <Icon name="facebook" size={16} className="shrink-0" />
                    Facebook
                  </dt>
                  <dd>
                    <a
                      href={facebook.href}
                      target="_blank"
                      // noopener is the security-relevant half: without it the
                      // opened page can reach back through window.opener.
                      rel="noopener noreferrer"
                      aria-label={`${VENUE.name} on Facebook (opens in a new tab)`}
                      className="text-ink transition-colors hover:text-clay-600"
                    >
                      {VENUE.name}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </Reveal>
        </div>

        <Reveal variants={slideInRight} amount={0.1}>
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-5 rounded-3xl border border-ink/8 bg-ivory-50/90 p-6 shadow-soft backdrop-blur-sm sm:p-8"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <FloatingLabelInput
                label="Your name"
                name="name"
                autoComplete="name"
                value={values.name}
                onChange={update('name')}
                error={errors.name}
                required
              />
              <FloatingLabelInput
                label="Email address"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={values.email}
                onChange={update('email')}
                error={errors.email}
                required
              />
              <FloatingLabelInput
                label="Phone (optional)"
                name="phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                value={values.phone}
                onChange={update('phone')}
                error={errors.phone}
              />
              <FloatingLabelSelect
                label="Type of event"
                name="eventType"
                options={EVENT_TYPE_OPTIONS}
                value={values.eventType}
                onChange={update('eventType')}
                error={errors.eventType}
                required
              />
              <FloatingLabelInput
                label="Preferred date"
                name="eventDate"
                type="date"
                value={values.eventDate}
                onChange={update('eventDate')}
                error={errors.eventDate}
                hint="Approximate is fine."
              />
              <FloatingLabelInput
                label="Expected guests"
                name="guests"
                type="number"
                min={1}
                inputMode="numeric"
                value={values.guests}
                onChange={update('guests')}
                error={errors.guests}
              />
            </div>

            <FloatingLabelTextarea
              label="Anything else we should know?"
              name="message"
              rows={4}
              value={values.message}
              onChange={update('message')}
              error={errors.message}
            />

            {/* The button stands alone. The reassurance that used to sit
                beside it now only appears after a successful send, in the
                status region below. */}
            <div>
              <Button type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting ? 'Sending…' : 'Send inquiry'}
              </Button>
            </div>

            {/*
              Submission feedback. `role="status"` announces it politely without
              stealing focus, and the region is always in the DOM — an element
              inserted at the same moment its content changes is often missed by
              screen readers entirely.
            */}
            <div role="status" aria-live="polite" className="min-h-[1.5rem]">
              <AnimatePresence mode="wait">
                {statusMessage && (
                  <motion.p
                    key={statusMessage}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={
                      state === 'success'
                        ? 'text-sm font-medium text-sage-800'
                        : 'text-sm font-medium text-clay-600'
                    }
                  >
                    {statusMessage}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
