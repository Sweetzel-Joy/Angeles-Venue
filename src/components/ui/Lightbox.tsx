'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { forwardRef, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { lightboxBackdrop, lightboxPanel } from '@/lib/animations';
import type { GalleryItem } from '@/types';

interface LightboxProps {
  items: readonly GalleryItem[];
  /** Index of the open item, or null when closed. */
  index: number | null;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void;
}

/**
 * Full-screen image viewer.
 *
 * The dialog behaviour here is the part worth reading carefully — a modal that
 * looks right but traps nothing is a keyboard dead end:
 *
 *  - Focus moves into the dialog on open and is **restored to the element that
 *    opened it** on close. Without restoration, closing drops the user back at
 *    the top of the document and they have to tab through the whole page again.
 *  - Tab and Shift+Tab wrap within the dialog. Escape closes; arrows page.
 *  - `aria-modal` + `role="dialog"` hide the page behind it from screen readers.
 *  - Background scroll is locked, compensating for the scrollbar width so the
 *    page underneath does not visibly jump as it disappears.
 */
export function Lightbox({ items, index, onClose, onNavigate }: LightboxProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  // The element focused before opening, so we can hand focus back on close.
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const isOpen = index !== null;
  const item = isOpen ? items[index] : undefined;
  /** Paging UI and the position counter only make sense for a set. */
  const hasMany = items.length > 1;

  const goNext = useCallback(() => {
    if (index === null || items.length === 0) return;
    onNavigate((index + 1) % items.length);
  }, [index, items.length, onNavigate]);

  const goPrevious = useCallback(() => {
    if (index === null || items.length === 0) return;
    onNavigate((index - 1 + items.length) % items.length);
  }, [index, items.length, onNavigate]);

  /* Focus management ------------------------------------------------------ */
  useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    // Deferred a frame: the panel is mid-mount when this effect first runs.
    const raf = requestAnimationFrame(() => closeButtonRef.current?.focus());

    return () => {
      cancelAnimationFrame(raf);
      previouslyFocused.current?.focus();
    };
  }, [isOpen]);

  /* Scroll lock ----------------------------------------------------------- */
  useEffect(() => {
    if (!isOpen) return;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    // Replacing the scrollbar's width with padding stops the page behind from
    // reflowing sideways the instant it is hidden.
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
    };
  }, [isOpen]);

  /* Keyboard -------------------------------------------------------------- */
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          onClose();
          break;
        case 'ArrowRight':
          event.preventDefault();
          goNext();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          goPrevious();
          break;
        case 'Tab': {
          // Cycle focus inside the panel rather than escaping to the page.
          const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          );
          if (!focusables || focusables.length === 0) return;

          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          if (!first || !last) return;

          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
          break;
        }
        default:
          break;
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose, goNext, goPrevious]);

  // Portals need a DOM to render into, so nothing happens during SSR.
  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && item && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-8"
          variants={lightboxBackdrop}
          initial="hidden"
          animate="visible"
          exit="exit"
          role="dialog"
          aria-modal="true"
          /*
            Not "Gallery image …". This viewer is shared — the About section
            opens it for a single photograph — and naming it after one caller
            misdescribes it for the other. The position is only announced when
            there is a set to be positioned within; "1 of 1" is noise.
          */
          aria-label={
            hasMany
              ? `Image ${index + 1} of ${items.length}: ${item.caption}`
              : `Image: ${item.caption}`
          }
        >
          {/* Backdrop. Presentational — the real close affordances are the
              button and Escape, both reachable without a pointer. */}
          <button
            type="button"
            aria-label="Close image viewer"
            tabIndex={-1}
            onClick={onClose}
            className="absolute inset-0 cursor-zoom-out bg-ink/80 backdrop-blur-sm"
          />

          <motion.div
            ref={panelRef}
            variants={lightboxPanel}
            className="relative z-10 flex max-h-full w-full max-w-5xl flex-col gap-4"
          >
            <div className="relative overflow-hidden rounded-2xl bg-ivory-100 shadow-lift">
              <Image
                src={item.image.src}
                alt={item.image.alt}
                width={item.image.width}
                height={item.image.height}
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="h-auto max-h-[75vh] w-full object-contain"
                priority
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-ivory-100">
                {item.caption}
                {/* Only meaningful with a set to count through. */}
                {hasMany && (
                  <span className="ml-3 text-ivory-100/60">
                    {index + 1} / {items.length}
                  </span>
                )}
              </p>

              <div className="flex items-center gap-2">
                {/*
                  Paging controls appear only for a set. With a single image
                  they would step from it back to itself — affordances that look
                  real and do nothing.
                */}
                {hasMany && (
                  <>
                    <LightboxControl label="Previous image" onClick={goPrevious}>
                      <ArrowIcon direction="left" />
                    </LightboxControl>
                    <LightboxControl label="Next image" onClick={goNext}>
                      <ArrowIcon direction="right" />
                    </LightboxControl>
                  </>
                )}
                <LightboxControl label="Close image viewer" onClick={onClose} ref={closeButtonRef}>
                  <CloseIcon />
                </LightboxControl>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/* -------------------------------------------------------------------------- */
/*  Local pieces                                                              */
/* -------------------------------------------------------------------------- */

interface LightboxControlProps {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}

const LightboxControl = forwardRef<HTMLButtonElement, LightboxControlProps>(
  function LightboxControl({ label, onClick, children }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        aria-label={label}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-ivory-100/25 text-ivory-100 transition-colors duration-200 hover:bg-ivory-100/15 focus-visible:ring-offset-ink"
      >
        {children}
      </button>
    );
  },
);

function ArrowIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ transform: direction === 'left' ? 'rotate(180deg)' : undefined }}
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
