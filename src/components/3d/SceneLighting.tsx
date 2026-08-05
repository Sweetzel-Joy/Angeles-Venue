'use client';

import { Environment, Lightformer } from '@react-three/drei';

interface SceneLightingProps {
  /** Drops the generated environment map on low-power devices. */
  simplified?: boolean;
}

/**
 * Shared lighting rig.
 *
 * Lighting an ivory scene is the opposite problem to lighting a dark one: there
 * is no glow to lean on, so the read has to come from *form* — warm key light
 * from one side, cool sage fill from the other, and enough ambient that nothing
 * ever goes muddy against the cream background.
 *
 * The environment map is built from `<Lightformer>` planes rather than a drei
 * `preset`. Presets look excellent but fetch a multi-megabyte HDRI from a CDN at
 * runtime, which means a hard dependency on that CDN being reachable — an
 * offline or firewalled visitor would get an unlit scene. Lightformers render
 * locally, cost nothing to download, and give finer control over where the
 * specular highlights land on the brass.
 */
export function SceneLighting({ simplified = false }: SceneLightingProps) {
  return (
    <>
      {/* High ambient floor — on a light background, deep shadows read as dirt. */}
      <ambientLight intensity={0.9} color="#FFF6EA" />

      {/* Warm key, upper-right. Casts the shadow that gives the rings depth. */}
      <directionalLight
        position={[4, 6, 3]}
        intensity={1.4}
        color="#FFD9B8"
        castShadow={!simplified}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.5}
        shadow-camera-far={20}
      />

      {/* Cool sage fill, lower-left — keeps the shadow side from going grey. */}
      <directionalLight position={[-5, -1, 2]} intensity={0.5} color="#C6D6BC" />

      {/* Terracotta rim from behind, to separate the model from the background. */}
      <pointLight position={[0, 1.5, -4]} intensity={2} color="#D08461" distance={12} />

      {!simplified && (
        <Environment resolution={128}>
          {/* Broad warm softbox overhead — the primary specular on the rings. */}
          <Lightformer
            form="rect"
            intensity={2.4}
            color="#FFE8D2"
            position={[0, 5, 1]}
            rotation={[-Math.PI / 2, 0, 0]}
            scale={[10, 6, 1]}
          />
          {/* Tight clay strip, camera-right — the warm edge highlight. */}
          <Lightformer
            form="rect"
            intensity={1.8}
            color="#E0A98B"
            position={[4, 1, 2]}
            rotation={[0, -Math.PI / 3, 0]}
            scale={[3, 5, 1]}
          />
          {/* Sage strip, camera-left, cooler and dimmer for shadow-side colour. */}
          <Lightformer
            form="rect"
            intensity={1.1}
            color="#B0BFA2"
            position={[-4, 0, 2]}
            rotation={[0, Math.PI / 3, 0]}
            scale={[3, 5, 1]}
          />
          {/* Ivory bounce from below, standing in for light off a pale floor. */}
          <Lightformer
            form="rect"
            intensity={0.9}
            color="#FDFBF7"
            position={[0, -4, 1]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={[8, 5, 1]}
          />
        </Environment>
      )}
    </>
  );
}
