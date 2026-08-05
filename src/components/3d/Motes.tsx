'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, Points } from 'three';

interface MotesProps {
  /** Particle count. Callers cut this hard on mobile. */
  count?: number;
  animate?: boolean;
}

const SPREAD_X = 14;
const SPREAD_Y = 9;
const SPREAD_Z = 7;

/**
 * Dust motes caught in the light — a `<Points>` cloud drifting upward.
 *
 * Against ivory these cannot glow, so they read instead as slightly warmer,
 * slightly denser specks than the background. Additive blending on a light
 * background *lightens* toward white, which is why the base colour is a
 * saturated clay rather than a pale one: it has somewhere to go.
 *
 * The whole cloud is animated by rotating and bobbing the parent `Points`
 * object rather than rewriting the position buffer each frame. Individual
 * per-particle motion would mean uploading ~9600 floats to the GPU every frame
 * for an effect nobody can consciously track.
 */
export function Motes({ count = 800, animate = true }: MotesProps) {
  const pointsRef = useRef<Points>(null);

  const positions = useMemo(() => {
    const array = new Float32Array(count * 3);

    for (let i = 0; i < count; i += 1) {
      // Deterministic spread — see Petals for why this is not Math.random().
      const a = (i * 0.618033988749) % 1;
      const b = (i * 0.381966011251) % 1;
      const c = (i * 0.7548776662) % 1;

      array[i * 3] = (a - 0.5) * SPREAD_X;
      array[i * 3 + 1] = (b - 0.5) * SPREAD_Y;
      array[i * 3 + 2] = (c - 0.5) * SPREAD_Z - 1;
    }

    return array;
  }, [count]);

  useFrame((state) => {
    const points = pointsRef.current;
    if (!points || !animate) return;

    const t = state.clock.elapsedTime;
    points.rotation.y = t * 0.02;
    points.position.y = Math.sin(t * 0.15) * 0.4;
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        sizeAttenuation
        color="#C0653F"
        transparent
        opacity={0.5}
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
