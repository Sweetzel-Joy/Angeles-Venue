'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useRef, useState } from 'react';
import { LazyFloatingShapes } from '@/components/3d/LazyHeroScene';
import { Button } from '@/components/ui/Button';
import {
  FloatingLabelInput,
  FloatingLabelSelect,
  FloatingLabelTextarea,
} from '@/components/ui/FloatingLabelInput';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { fadeInUp, slideInRight } from '@/lib/animations';
import { EVENT_TYPE_OPTIONS, VENUE } from '@/lib/content';
import { hasErrors, validateBooking } from '@/lib/validation';
import type { BookingEnquiry, BookingFieldErrors, ContactApiResponse } from '@/types';

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

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
      className="relative overflow-hidden bg-ivory-50 py-24 md:py-36"
    >
      {/* Ambient 3D backdrop. Client-only, desktop-only, and behind a gradient
          wash so form contrast never depends on what happens to drift past. */}
      <div aria-hidden="true" className="absolute inset-0">
        <LazyFloatingShapes />
        <div className="absolute inset-0 bg-gradient-to-b from-ivory-50 via-ivory-50/70 to-ivory-50" />
      </div>

      <div className="container-page relative grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div className="flex flex-col gap-8">
          <SectionHeading
            id="booking-heading"
            eyebrow="Enquire"
            title="Tell us about your event"
            description="Send us the shape of the day and we will come back with availability, pricing and a floor plan."
          />

          <Reveal variants={fadeInUp} delay={0.2}>
            <dl className="flex flex-col gap-5 border-t border-ink/10 pt-8 text-sm">
              <div className="flex flex-col gap-1">
                <dt className="text-ink-faint">Call us</dt>
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
                <dt className="text-ink-faint">Email us</dt>
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
                <dt className="text-ink-faint">Visit us</dt>
                <dd className="not-italic text-ink">
                  <address className="not-italic">
                    {VENUE.address.street}
                    <br />
                    {VENUE.address.city}, {VENUE.address.region}{' '}
                    {VENUE.address.postalCode}
                  </address>
                </dd>
              </div>
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

            <div className="flex flex-wrap items-center gap-4">
              <Button type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting ? 'Sending…' : 'Send enquiry'}
              </Button>
              <p className="text-xs text-ink-faint">
                We reply to every enquiry within one business day.
              </p>
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
