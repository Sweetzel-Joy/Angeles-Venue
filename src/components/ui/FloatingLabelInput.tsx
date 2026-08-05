'use client';

import { forwardRef, useId, useState } from 'react';
import { cn } from '@/lib/utils';

interface FieldBaseProps {
  label: string;
  error?: string;
  /** Extra guidance rendered under the field, announced with the input. */
  hint?: string;
  className?: string;
}

export interface FloatingLabelInputProps
  extends FieldBaseProps,
    Omit<React.InputHTMLAttributes<HTMLInputElement>, keyof FieldBaseProps> {}

export interface FloatingLabelTextareaProps
  extends FieldBaseProps,
    Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, keyof FieldBaseProps> {}

export interface FloatingLabelSelectProps
  extends FieldBaseProps,
    Omit<React.SelectHTMLAttributes<HTMLSelectElement>, keyof FieldBaseProps> {
  options: readonly string[];
  placeholder?: string;
}

/**
 * Shared field styling.
 *
 * A note on the floating label pattern generally: it is often implemented by
 * putting the field name in `placeholder` and animating a fake label. That
 * version fails badly — the name vanishes the moment you start typing, so
 * anyone who loses their place has nothing to recover it from, and screen
 * readers get no programmatic label at all.
 *
 * Here every field has a real `<label for>` bound to the input. The float is
 * purely a `transform` on that same real label, so it works with autofill,
 * survives zoom, and reads correctly to assistive tech.
 */
const fieldStyles =
  'peer w-full rounded-xl border bg-ivory-50/80 px-4 pb-2.5 pt-6 text-base text-ink ' +
  'outline-none transition-colors duration-200 placeholder-transparent ' +
  'hover:border-ink/30 focus:border-clay-500';

const labelStyles =
  'pointer-events-none absolute left-4 top-4 origin-left text-base text-ink-muted ' +
  'transition-transform duration-200 ease-out will-change-transform ' +
  // Floats when focused, and stays floated when the field has content.
  // `:not(:placeholder-shown)` is what detects content — hence the transparent
  // placeholder above, which exists only to make this selector work.
  'peer-focus:-translate-y-3 peer-focus:scale-[0.78] ' +
  'peer-[:not(:placeholder-shown)]:-translate-y-3 peer-[:not(:placeholder-shown)]:scale-[0.78] ' +
  'motion-reduce:transition-none';

function borderColor(hasError: boolean): string {
  return hasError ? 'border-clay-600' : 'border-ink/15';
}

/** Error + hint text, wired to the field via aria-describedby. */
function FieldMessages({
  error,
  hint,
  errorId,
  hintId,
}: {
  error?: string;
  hint?: string;
  errorId: string;
  hintId: string;
}) {
  return (
    <>
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-xs text-ink-faint">
          {hint}
        </p>
      )}
      {/*
        `role="alert"` announces the message the moment it appears, rather than
        leaving the user to discover it by tabbing back through the form.
      */}
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs font-medium text-clay-600">
          {error}
        </p>
      )}
    </>
  );
}

export const FloatingLabelInput = forwardRef<HTMLInputElement, FloatingLabelInputProps>(
  function FloatingLabelInput({ label, error, hint, className, id, ...rest }, ref) {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const errorId = `${fieldId}-error`;
    const hintId = `${fieldId}-hint`;

    return (
      <div className={cn('relative', className)}>
        <input
          ref={ref}
          id={fieldId}
          // Required for the `:not(:placeholder-shown)` float — see above.
          placeholder={label}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={cn(fieldStyles, borderColor(Boolean(error)))}
          {...rest}
        />
        <label htmlFor={fieldId} className={labelStyles}>
          {label}
        </label>
        <FieldMessages error={error} hint={hint} errorId={errorId} hintId={hintId} />
      </div>
    );
  },
);

export const FloatingLabelTextarea = forwardRef<
  HTMLTextAreaElement,
  FloatingLabelTextareaProps
>(function FloatingLabelTextarea(
  { label, error, hint, className, id, rows = 4, ...rest },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;

  return (
    <div className={cn('relative', className)}>
      <textarea
        ref={ref}
        id={fieldId}
        rows={rows}
        placeholder={label}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        className={cn(fieldStyles, borderColor(Boolean(error)), 'resize-y')}
        {...rest}
      />
      <label htmlFor={fieldId} className={labelStyles}>
        {label}
      </label>
      <FieldMessages error={error} hint={hint} errorId={errorId} hintId={hintId} />
    </div>
  );
});

/**
 * Select fields cannot use the `:placeholder-shown` trick — a `<select>` has no
 * placeholder. The label floats based on whether a value is set instead, which
 * is tracked here rather than inferred from CSS.
 */
export const FloatingLabelSelect = forwardRef<HTMLSelectElement, FloatingLabelSelectProps>(
  function FloatingLabelSelect(
    { label, error, hint, className, id, options, placeholder = '', value, onChange, ...rest },
    ref,
  ) {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const errorId = `${fieldId}-error`;
    const hintId = `${fieldId}-hint`;
    const [hasValue, setHasValue] = useState(Boolean(value));

    return (
      <div className={cn('relative', className)}>
        <select
          ref={ref}
          id={fieldId}
          value={value}
          onChange={(event) => {
            setHasValue(event.target.value !== '');
            onChange?.(event);
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={cn(
            fieldStyles,
            borderColor(Boolean(error)),
            'appearance-none bg-[length:16px] bg-[right_1rem_center] bg-no-repeat pr-10',
          )}
          style={{
            // Inline chevron as a data URI — no icon library, no extra request.
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B6155' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
          }}
          {...rest}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <label
          htmlFor={fieldId}
          className={cn(
            'pointer-events-none absolute left-4 top-4 origin-left text-base text-ink-muted transition-transform duration-200 ease-out will-change-transform motion-reduce:transition-none',
            (hasValue || Boolean(value)) && '-translate-y-3 scale-[0.78]',
          )}
        >
          {label}
        </label>
        <FieldMessages error={error} hint={hint} errorId={errorId} hintId={hintId} />
      </div>
    );
  },
);
