'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';

interface ChandelierProps {
  /** When false, the piece holds a single pose and never updates. */
  animate?: boolean;
  /** Halves the geometry detail and drop count for low-power devices. */
  simplified?: boolean;
}

interface RingSpec {
  radius: number;
  y: number;
  tube: number;
  /** Radians per second. Alternating signs give counter-rotation. */
  speed: number;
}

interface DropSpec {
  position: [number, number, number];
  scale: number;
}

/**
 * The hero centrepiece: a stack of thin brass rings with glass drops suspended
 * between them, counter-rotating at slightly different speeds.
 *
 * The counter-rotation is the whole trick. Rings turning together read as one
 * rigid object spinning; turning against each other, they continuously reveal
 * new intersections, so the silhouette never repeats even though every ring is
 * on a fixed loop. Speeds are deliberately non-harmonic (0.16 / -0.11 / 0.07)
 * so the pattern does not visibly cycle.
 */
export function Chandelier({ animate = true, simplified = false }: ChandelierProps) {
  const groupRef = useRef<Group>(null);
  const ringRefs = useRef<Array<Group | null>>([]);

  const rings = useMemo<RingSpec[]>(
    () => [
      { radius: 1.75, y: 0.55, tube: 0.012, speed: 0.16 },
      { radius: 1.35, y: 0.0, tube: 0.014, speed: -0.11 },
      { radius: 0.9, y: -0.5, tube: 0.012, speed: 0.07 },
    ],
    [],
  );

  /**
   * Drops are laid out once, deterministically. A seeded pseudo-random spread
   * beats `Math.random()` here — the arrangement must be identical on every
   * mount, or the piece visibly rearranges itself whenever React remounts the
   * canvas (a resize past the mobile breakpoint, for instance).
   */
  const drops = useMemo<DropSpec[]>(() => {
    const perRing = simplified ? 5 : 9;
    const result: DropSpec[] = [];

    rings.forEach((ring, ringIndex) => {
      for (let i = 0; i < perRing; i += 1) {
        const angle = (i / perRing) * Math.PI * 2 + ringIndex * 0.4;
        // Golden-ratio jitter: even coverage without looking mechanically regular.
        const jitter = ((i * 0.618033 + ringIndex * 0.381966) % 1) - 0.5;
        result.push({
          position: [
            Math.cos(angle) * ring.radius,
            ring.y - 0.18 - Math.abs(jitter) * 0.34,
            Math.sin(angle) * ring.radius,
          ],
          scale: 0.05 + Math.abs(jitter) * 0.05,
        });
      }
    });

    return result;
  }, [rings, simplified]);

  useFrame((state, delta) => {
    if (!animate) return;

    // Clamp delta so a backgrounded tab does not resume with a huge jump.
    const step = Math.min(delta, 0.05);

    ringRefs.current.forEach((ring, index) => {
      const spec = rings[index];
      if (ring && spec) ring.rotation.y += spec.speed * step;
    });

    if (groupRef.current) {
      // Slow bob + tilt, tied to absolute time so it is independent of framerate.
      const t = state.clock.elapsedTime;
      groupRef.current.position.y = Math.sin(t * 0.4) * 0.08;
      groupRef.current.rotation.z = Math.sin(t * 0.25) * 0.03;
      groupRef.current.rotation.x = Math.cos(t * 0.2) * 0.02;
    }
  });

  const ringSegments = simplified ? [8, 48] : [12, 96];

  // No ARIA attributes anywhere in here: these are three.js objects, not DOM
  // nodes. R3F forwards unknown JSX props onto the underlying object, so an
  // `aria-hidden` here throws rather than being ignored. The whole canvas is
  // marked decorative once, on its wrapper element in HeroScene.
  return (
    <group ref={groupRef}>
      {rings.map((ring, index) => (
        <group
          key={ring.radius}
          ref={(node) => {
            ringRefs.current[index] = node;
          }}
          position={[0, ring.y, 0]}
        >
          <mesh castShadow={!simplified} receiveShadow={!simplified}>
            <torusGeometry
              args={[ring.radius, ring.tube, ringSegments[0], ringSegments[1]]}
            />
            {/* Warm brass: high metalness, low roughness so the lightformers
                land as distinct highlights rather than a flat sheen. */}
            <meshStandardMaterial
              color="#C89A63"
              metalness={0.95}
              roughness={0.22}
              envMapIntensity={1.4}
            />
          </mesh>
        </group>
      ))}

      {/* Glass drops. Not parented to the rings — they hang still while the
          rings turn behind them, which reads as suspension rather than spin. */}
      {drops.map((drop, index) => (
        <mesh
          key={`drop-${index}`}
          position={drop.position}
          scale={drop.scale}
          castShadow={!simplified}
        >
          <octahedronGeometry args={[1, simplified ? 0 : 1]} />
          <meshStandardMaterial
            color="#F0CDB9"
            metalness={0.1}
            roughness={0.05}
            transparent
            opacity={0.85}
            envMapIntensity={2}
          />
        </mesh>
      ))}

      {/* Central stem + finial, so the rings read as hung from something. */}
      <mesh position={[0, 1.4, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 2.4, 6]} />
        <meshStandardMaterial color="#C89A63" metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.95, 0]} castShadow={!simplified}>
        <sphereGeometry args={[0.09, simplified ? 8 : 24, simplified ? 8 : 24]} />
        <meshStandardMaterial
          color="#C0653F"
          metalness={0.6}
          roughness={0.25}
          envMapIntensity={1.6}
        />
      </mesh>
    </group>
  );
}
