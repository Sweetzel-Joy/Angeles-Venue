/**
 * Feature-detects a usable WebGL context.
 *
 * Worth doing explicitly rather than letting the canvas fail: a machine with
 * WebGL disabled (older hardware, a locked-down browser profile, a blocklisted
 * driver) would otherwise get a blank rectangle where the hero should be. The
 * probe canvas is thrown away immediately and its context released, so this
 * costs nothing beyond the one-off call.
 */
export function isWebGLAvailable(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const canvas = document.createElement('canvas');
    const context =
      canvas.getContext('webgl2') ??
      canvas.getContext('webgl') ??
      canvas.getContext('experimental-webgl');

    if (!context) return false;

    // Free the context immediately — browsers cap concurrent WebGL contexts
    // (often at 8–16), and leaking probe contexts would eventually starve the
    // real one.
    const lose = (context as WebGLRenderingContext).getExtension(
      'WEBGL_lose_context',
    );
    lose?.loseContext();

    return true;
  } catch {
    return false;
  }
}
