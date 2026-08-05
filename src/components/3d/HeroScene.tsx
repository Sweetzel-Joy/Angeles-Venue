'use client';

import { Suspense, useEffect, useState, type ReactNode } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { ContactShadows, Float, PerspectiveCamera } from '@react-three/drei';
import { CanvasErrorBoundary } from './CanvasErrorBoundary';
import { Chandelier } from './Chandelier';
import { Motes } from './Motes';
import { Petals } from './Petals';
import { SceneLighting } from './SceneLighting';
import { useIsInView } from '@/lib/hooks/useInViewOnce';
import { useIsMobile } from '@/lib/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { isWebGLAvailable } from '@/lib/webgl';

/** The CSS gradient shown whenever the real scene cannot or should not run. */
function SceneFallback() {
  return <div className="scene-fallback absolute inset-0" aria-hidden="true" />;
}

/** Widest extent of the chandelier in world units, plus breathing room. */
const MODEL_EXTENT = 4.6;

/**
 * Ceiling on the fit scale, and how far the piece is lifted above centre.
 *
 * Both are composition, not fit: at scale 1 and dead centre the rings run
 * straight through the middle of the headline. Lifting it and easing it back
 * puts the mass of the object above the type, so it frames the words instead of
 * competing with them, and the drops fall behind the sub-copy.
 */
const MAX_SCALE = 0.86;
const VERTICAL_LIFT = 0.55;

/**
 * Scales the chandelier to fit the canvas width.
 *
 * Without this the model is sized for a landscape viewport, and on a phone —
 * where the visible world is roughly a third as wide — the rings swamp the
 * frame and cut straight through the headline. A fixed mobile scale would work
 * until some other aspect ratio came along; deriving it from `viewport.width`
 * (world units at the focal plane, which R3F recomputes on resize) means the
 * model fits any viewport, including a desktop window dragged narrow.
 *
 * Capped at 1 so it never scales *up* past its designed size on ultrawide.
 */
function FitToViewport({ children }: { children: ReactNode }) {
  const viewport = useThree((state) => state.viewport);
  const scale = Math.min(MAX_SCALE, viewport.width / MODEL_EXTENT);

  // Lift scales with the model so the composition holds at any size.
  return (
    <group scale={scale} position={[0, VERTICAL_LIFT * scale, 0]}>
      {children}
    </group>
  );
}

/**
 * The hero's 3D scene.
 *
 * Only ever reached through `LazyHeroScene`, which loads it with `ssr: false`.
 * Importing it directly from a server component breaks the build — three
 * touches `window` at module scope.
 *
 * Degradation, in increasing order of aggressiveness:
 *
 *  1. `prefers-reduced-motion` → `frameloop="demand"`. R3F renders exactly one
 *     frame on mount and then idles. The visitor gets a composed still image
 *     rather than a blank box, which is the right reading of "reduce motion":
 *     remove the movement, keep the content.
 *  2. Below `md` → petals 40→12, motes 800→200, no contact shadows, no
 *     generated environment map, DPR capped at 1.5.
 *  3. Scrolled out of view → `frameloop="never"`. On a page this long the hero
 *     is off screen for most of the session; there is no reason to keep a GPU
 *     busy for it.
 *  4. No WebGL, or anything inside the scene throws → the CSS gradient, via
 *     feature detection up front and an error boundary for everything else.
 */
export function HeroScene() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const isMobile = useIsMobile();
  const [containerRef, inView] = useIsInView<HTMLDivElement>('120px');

  // `null` = not yet probed. Checked in an effect because it touches `document`,
  // and rendering the canvas before we know would defeat the point.
  const [webGLReady, setWebGLReady] = useState<boolean | null>(null);
  useEffect(() => setWebGLReady(isWebGLAvailable()), []);

  const animate = !prefersReducedMotion;
  const petalCount = isMobile ? 12 : 40;
  const moteCount = isMobile ? 200 : 800;

  const frameloop = prefersReducedMotion ? 'demand' : inView ? 'always' : 'never';

  if (webGLReady === false) {
    return <SceneFallback />;
  }

  // The decorative marker goes on the wrapper below, not on <Canvas>. R3F
  // spreads unrecognised props onto the three.js renderer rather than the DOM
  // canvas, so aria attributes set there never reach the accessibility tree.
  // Marking the wrapper hides the whole subtree, which is what we want: the
  // hero section already carries the real accessible name.
  return (
    <div ref={containerRef} className="absolute inset-0" aria-hidden="true">
      {/* Painted underneath the canvas at all times: it covers the gap before
          WebGL is probed, and shows through the canvas's alpha afterwards, so
          there is no flash on either side of the swap. */}
      <SceneFallback />

      {webGLReady && (
        <CanvasErrorBoundary fallback={<SceneFallback />}>
          <Canvas
            // Capping DPR is the single biggest perf lever on dense screens: an
            // uncapped 3x display renders 9x the pixels for no visible gain.
            dpr={isMobile ? [1, 1.5] : [1, 2]}
            frameloop={frameloop}
            shadows={!isMobile && !prefersReducedMotion}
            gl={{
              antialias: !isMobile,
              alpha: true,
              powerPreference: 'high-performance',
              preserveDrawingBuffer: false,
            }}
            className="!absolute inset-0"
          >
            <PerspectiveCamera makeDefault position={[0, 0.2, 6.5]} fov={42} />

            <Suspense fallback={null}>
              <SceneLighting simplified={isMobile} />

              {/* Float adds the slow idle drift. Disabled outright under reduced
                  motion — a still frame should not be caught mid-drift. */}
              <FitToViewport>
                <Float
                  enabled={animate}
                  speed={1.2}
                  rotationIntensity={0.25}
                  floatIntensity={0.4}
                  floatingRange={[-0.1, 0.1]}
                >
                  <Chandelier animate={animate} simplified={isMobile} />
                </Float>
              </FitToViewport>

              <Petals count={petalCount} animate={animate} />
              <Motes count={moteCount} animate={animate} />

              {/* Grounds the chandelier so it is not floating in undefined
                  space. Skipped on mobile — it is a second render pass. */}
              {!isMobile && !prefersReducedMotion && (
                <ContactShadows
                  position={[0, -2.6, 0]}
                  opacity={0.28}
                  scale={12}
                  blur={2.8}
                  far={5}
                  color="#833E24"
                  resolution={512}
                />
              )}
            </Suspense>
          </Canvas>
        </CanvasErrorBoundary>
      )}
    </div>
  );
}

export default HeroScene;
