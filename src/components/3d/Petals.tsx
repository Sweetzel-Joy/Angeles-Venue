'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, DoubleSide, InstancedMesh, Object3D } from 'three';

interface PetalsProps {
  /** How many petals to draw. Callers drop this hard on mobile. */
  count?: number;
  animate?: boolean;
}

interface PetalState {
  x: number;
  y: number;
  z: number;
  /** Downward drift speed. */
  fall: number;
  /** Phase offset so petals do not sway in unison. */
  phase: number;
  swayAmplitude: number;
  spin: number;
  scale: number;
}

const FIELD_HEIGHT = 9;
const FIELD_WIDTH = 11;
const FIELD_DEPTH = 5;

/**
 * A drifting field of translucent petals, drawn as a single `InstancedMesh`.
 *
 * Instancing is what makes the count affordable: 40 petals as 40 separate
 * meshes is 40 draw calls a frame, while one instanced mesh is one call
 * regardless of count. The per-instance matrices are written on the CPU each
 * frame, which is cheap at these numbers and avoids a custom shader.
 *
 * Positions are seeded deterministically (no `Math.random()`) so the field is
 * identical on every mount — otherwise the layout visibly reshuffles whenever
 * the canvas remounts.
 */
export function Petals({ count = 40, animate = true }: PetalsProps) {
  const meshRef = useRef<InstancedMesh>(null);
  // Reused scratch object — allocating an Object3D per instance per frame would
  // be ~2400 allocations a second at 60fps.
  const dummy = useMemo(() => new Object3D(), []);

  const petals = useMemo<PetalState[]>(() => {
    const result: PetalState[] = [];
    for (let i = 0; i < count; i += 1) {
      // Two irrational multipliers give a well-distributed, repeatable spread.
      const a = (i * 0.618033988749) % 1;
      const b = (i * 0.381966011251) % 1;
      const c = (i * 0.7548776662) % 1;

      result.push({
        x: (a - 0.5) * FIELD_WIDTH,
        y: (b - 0.5) * FIELD_HEIGHT,
        z: (c - 0.5) * FIELD_DEPTH - 1,
        fall: 0.18 + b * 0.3,
        phase: a * Math.PI * 2,
        swayAmplitude: 0.3 + c * 0.5,
        spin: 0.2 + a * 0.5,
        scale: 0.09 + c * 0.1,
      });
    }
    return result;
  }, [count]);

  // Alternating clay/sage tint, assigned once per instance.
  const colors = useMemo(() => {
    const clay = new Color('#E0A98B');
    const sage = new Color('#B0BFA2');
    const blush = new Color('#F0CDB9');
    return petals.map((_, i) => {
      const pick = i % 3;
      return pick === 0 ? clay : pick === 1 ? sage : blush;
    });
  }, [petals]);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    // Even when frozen we run once, so the static pose is a composed frame
    // rather than every petal stacked at the origin.
    const t = animate ? state.clock.elapsedTime : 0;

    petals.forEach((petal, i) => {
      // Wrap through the field height so the fall loops seamlessly.
      const fallen = (petal.y - t * petal.fall + FIELD_HEIGHT * 10) % FIELD_HEIGHT;
      const y = fallen - FIELD_HEIGHT / 2;

      dummy.position.set(
        petal.x + Math.sin(t * 0.4 + petal.phase) * petal.swayAmplitude,
        y,
        petal.z + Math.cos(t * 0.3 + petal.phase) * 0.3,
      );
      dummy.rotation.set(
        t * petal.spin * 0.5 + petal.phase,
        t * petal.spin + petal.phase,
        Math.sin(t * 0.5 + petal.phase) * 0.6,
      );
      dummy.scale.setScalar(petal.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
  });

  // Instance colours are applied in an effect, not a memo: the ref is still
  // null during render, so a memo would silently no-op on first mount and every
  // petal would come out white.
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    colors.forEach((color, i) => mesh.setColorAt(i, color));
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [colors]);

  return (
    <instancedMesh
      ref={meshRef}
      // `args` must carry the count — InstancedMesh allocates its buffers up
      // front and cannot grow, so changing count remounts the mesh.
      args={[undefined, undefined, count]}
      frustumCulled={false}
    >
      {/* A stretched, tapered plane reads as a petal from any angle without
          the cost of real geometry. */}
      <circleGeometry args={[1, 8]} />
      <meshStandardMaterial
        transparent
        opacity={0.55}
        roughness={0.6}
        metalness={0}
        // Petals are lit from both sides as they tumble.
        side={DoubleSide}
        envMapIntensity={0.8}
      />
    </instancedMesh>
  );
}
