'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import type { Group } from 'three';
import { CanvasErrorBoundary } from './CanvasErrorBoundary';
import { useIsInView } from '@/lib/hooks/useInViewOnce';
import { useIsMobile } from '@/lib/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { isWebGLAvailable } from '@/lib/webgl';

interface ShapeSpec {
  position: [number, number, number];
  scale: number;
  color: string;
  kind: 'ico' | 'torus' | 'capsule';
}

/**
 * Deliberately sparse: this sits *behind a form*, and the form has to stay the
 * thing you look at. Six shapes, low contrast, slow drift.
 */
const SHAPES: readonly ShapeSpec[] = [
  { position: [-3.2, 1.4, -1], scale: 0.55, color: '#E0A98B', kind: 'ico' },
  { position: [3.4, -0.9, -1.5], scale: 0.7, color: '#B0BFA2', kind: 'torus' },
  { position: [-2.6, -1.7, -0.5], scale: 0.4, color: '#F0CDB9', kind: 'capsule' },
  { position: [2.8, 1.9, -2], scale: 0.5, color: '#CBD5C0', kind: 'ico' },
  { position: [0.4, -2.3, -2.5], scale: 0.6, color: '#E4D6C1', kind: 'torus' },
  { position: [-4.1, -0.2, -2.2], scale: 0.35, color: '#D08461', kind: 'capsule' },
];

function ShapeField({ animate, simplified }: { animate: boolean; simplified: boolean }) {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (!animate || !groupRef.current) return;
    // One very slow rotation of the whole field. Enough to feel alive, not
    // enough to pull attention off the form in front of it.
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.04;
  });

  const detail = simplified ? 0 : 1;
  const segments = simplified ? 8 : 24;

  return (
    <group ref={groupRef}>
      {SHAPES.map((shape, index) => (
        <Float
          key={`${shape.kind}-${index}`}
          enabled={animate}
          speed={0.8 + index * 0.15}
          rotationIntensity={0.4}
          floatIntensity={0.6}
        >
          <mesh position={shape.position} scale={shape.scale}>
            {shape.kind === 'ico' && <icosahedronGeometry args={[1, detail]} />}
            {shape.kind === 'torus' && (
              <torusGeometry args={[0.8, 0.22, segments / 2, segments * 2]} />
            )}
            {shape.kind === 'capsule' && (
              <capsuleGeometry args={[0.5, 0.8, segments / 4, segments]} />
            )}
            <meshStandardMaterial
              color={shape.color}
              roughness={0.35}
              metalness={0.15}
              transparent
              // Low opacity is doing the real accessibility work here: text sits
              // on top of this, and contrast has to survive whatever drifts past.
              opacity={0.5}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

/**
 * Ambient 3D backdrop for the booking section.
 *
 * A much lighter scene than the hero: no shadows, no environment map, no
 * instancing — six primitives and two lights. It is background texture, and the
 * budget reflects that.
 */
export function FloatingShapes() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const isMobile = useIsMobile();
  const [containerRef, inView] = useIsInView<HTMLDivElement>('120px');
  const [webGLReady, setWebGLReady] = useState<boolean | null>(null);

  useEffect(() => setWebGLReady(isWebGLAvailable()), []);

  // On mobile this scene is pure decoration behind a form the visitor is trying
  // to fill in on a small screen. Not worth a WebGL context — the CSS gradient
  // beneath it carries the same colour story for free.
  if (!webGLReady || isMobile) {
    return null;
  }

  const animate = !prefersReducedMotion;
  const frameloop = prefersReducedMotion ? 'demand' : inView ? 'always' : 'never';

  return (
    <div ref={containerRef} className="absolute inset-0" aria-hidden="true">
      <CanvasErrorBoundary fallback={null}>
        {/* aria-hidden lives on the wrapper div above — see HeroScene. */}
        <Canvas
          dpr={[1, 1.5]}
          frameloop={frameloop}
          camera={{ position: [0, 0, 8], fov: 45 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
          className="!absolute inset-0"
        >
          <Suspense fallback={null}>
            <ambientLight intensity={1.1} color="#FFF6EA" />
            <directionalLight position={[3, 4, 5]} intensity={1.2} color="#FFD9B8" />
            <directionalLight position={[-4, -2, 2]} intensity={0.5} color="#C6D6BC" />
            <ShapeField animate={animate} simplified={isMobile} />
          </Suspense>
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}

export default FloatingShapes;
