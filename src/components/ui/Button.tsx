'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface BaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
}

export interface ButtonProps
  extends BaseProps,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> {}

export interface LinkButtonProps
  extends BaseProps,
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> {
  href: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-clay-500 text-ivory-50 hover:bg-clay-600 active:bg-clay-700 shadow-soft hover:shadow-lift',
  secondary:
    'bg-transparent text-ink border border-ink/20 hover:border-ink/45 hover:bg-ink/[0.03]',
  ghost: 'bg-transparent text-clay-600 hover:text-clay-700 hover:bg-clay-500/8',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
};

/**
 * `transform` and `box-shadow` only on hover — no padding or border-width
 * changes, which would reflow the surrounding text on every hover.
 */
const baseStyles =
  'inline-flex items-center justify-center gap-2 rounded-full font-sans font-medium ' +
  'tracking-wide transition-[background-color,box-shadow,transform,color,border-color] ' +
  'duration-300 ease-out will-change-transform hover:-translate-y-0.5 active:translate-y-0 ' +
  'disabled:pointer-events-none disabled:opacity-50 ' +
  // motion-reduce is Tailwind's prefers-reduced-motion:reduce variant. The lift
  // is decorative; the colour change alone still confirms the hover.
  'motion-reduce:transform-none motion-reduce:transition-colors';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className, children, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      // Explicit default: an unspecified <button> inside a <form> submits it,
      // which is a recurring source of accidental submissions.
      type={type}
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      {...rest}
    >
      {children}
    </button>
  );
});

/**
 * Anchor styled as a button. A separate component rather than an `as` prop so
 * that `href` is required here and impossible there — a "link" that is actually
 * a button breaks middle-click, right-click, and keyboard expectations.
 */
export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  function LinkButton(
    { variant = 'primary', size = 'md', className, children, href, ...rest },
    ref,
  ) {
    return (
      <a
        ref={ref}
        href={href}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...rest}
      >
        {children}
      </a>
    );
  },
);
