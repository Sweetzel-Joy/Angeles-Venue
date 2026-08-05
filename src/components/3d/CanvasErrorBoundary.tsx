'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface CanvasErrorBoundaryProps {
  children: ReactNode;
  /** Rendered in place of the scene if anything inside it throws. */
  fallback: ReactNode;
}

interface CanvasErrorBoundaryState {
  hasError: boolean;
}

/**
 * Catches render-time failures inside a 3D scene.
 *
 * This exists because a decorative canvas must never be able to take the page
 * down with it. Shader compilation failures, a lost context, and driver quirks
 * all surface as thrown errors during render — without a boundary, React
 * unmounts the whole tree and the visitor gets a blank page instead of a
 * landing page with one missing ornament.
 *
 * Must be a class component: `getDerivedStateFromError` has no hook equivalent.
 */
export class CanvasErrorBoundary extends Component<
  CanvasErrorBoundaryProps,
  CanvasErrorBoundaryState
> {
  override state: CanvasErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): CanvasErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    // Surfaced in the console rather than swallowed — a scene that silently
    // never renders is much harder to debug than one that says why.
    console.error('[3D] Scene failed to render, falling back:', error, info);
  }

  override render(): ReactNode {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
