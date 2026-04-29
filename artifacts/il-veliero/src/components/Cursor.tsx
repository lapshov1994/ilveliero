import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Cursor — there is NO visible cursor sprite. Instead, the user's pointer
 * silently disturbs the surface of the sea: every meaningful move spawns
 * one or two flowing tilde-style wave strokes that drift backwards along
 * the motion line and dissipate.
 *
 * Visual reference: classic ocean-ripple iconography — flat horizontal
 * sine "tildes" (~), painterly brush strokes with rounded ends, in a
 * cyan / teal / navy palette with rare gold sun-glints.
 *
 * Design notes:
 *   - No ship, no mascot, no hard "cursor" object — the surface itself
 *     is the cursor.
 *   - Waves come in many shapes (single bumps, two/three-cycle ripples,
 *     wide low horizons, asymmetric curls) and many tones so
 *     consecutive waves never read as a copy-paste pattern.
 *   - Each wave is drawn as TWO coaxial strokes — a wide translucent
 *     halo and a crisp main stroke on top — to suggest the soft edge
 *     of a real ink/brush stroke.
 *   - Strictly pointer-driven: scrolling does not generate ripples.
 */
export default function Cursor() {
  const trailLayerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trailLayer = trailLayerRef.current;
    if (!trailLayer) return;

    let lastX = 0;
    let lastY = 0;
    let lastTrailX = 0;
    let lastTrailY = 0;
    let initialized = false;
    let dirX = 0;
    let dirY = 1;

    /**
     * A library of wave forms, varying in shape, length and amplitude.
     * Categories included:
     *   - Gentle long swells (calm sea)
     *   - Choppy short crests (fresh wind)
     *   - Asymmetric curls (wave breaking)
     *   - Splash-style dot rings (impact)
     *   - Long sweeping arcs (open ocean)
     */
    type Form = {
      crestD: string;
      foamD?: string;
      sprayDots?: Array<{ x: number; y: number; r: number }>;
      halfLen: number;
      halfAmp: number;
      // Visual weight — smaller forms get thinner strokes, big forms
      // get heavier strokes so they read at distance.
      weight: number;
    };

    // Forms are CURLY brush-stroke ripples laid PERPENDICULAR across
    // the motion line — each one looks like a band of disturbed water
    // crossing the wake of an invisible hull. They use cubic Bézier
    // (C/S) curves so the line genuinely loops and weaves rather than
    // oscillating like a textbook sine. All amplitudes are symmetric
    // around y=0, so the centre of each ripple stays on the path.
    const WAVE_FORMS: Form[] = [
      // 1. Two-loop curl — a gentle S-with-an-S, the "default ripple".
      {
        crestD: 'M -24 0 C -18 -9 -10 -10 -6 -2 C -2 7 4 8 8 1 C 12 -6 18 -7 24 0',
        halfLen: 24, halfAmp: 10, weight: 3.0,
      },
      // 2. Long four-loop ripple — flowing serpentine across the wake.
      {
        crestD: 'M -46 0 C -38 -8 -32 -9 -26 -2 C -20 6 -14 7 -8 1 C -2 -6 4 -8 10 -1 C 16 6 22 7 28 1 C 34 -5 40 -5 46 0',
        halfLen: 46, halfAmp: 9, weight: 2.7,
      },
      // 3. Tight single curl — quick coiled flick for micro-moves.
      {
        crestD: 'M -14 0 C -10 -8 -2 -10 0 -2 C 2 8 10 8 14 0',
        halfLen: 14, halfAmp: 9, weight: 2.6,
      },
      // 4. Wide three-loop swell — open lazy meander.
      {
        crestD: 'M -32 0 C -24 -6 -18 -8 -12 -1 C -6 6 -2 7 4 0 C 10 -7 16 -7 22 -1 C 28 5 30 4 32 0',
        halfLen: 32, halfAmp: 8, weight: 2.9,
      },
      // 5. Asymmetric breaking curl — big lobe on the left, tail right.
      {
        crestD: 'M -34 0 C -28 -13 -16 -14 -10 -3 C -4 7 2 9 8 2 C 14 -3 22 -3 30 1 C 33 2 34 3 34 4',
        halfLen: 34, halfAmp: 14, weight: 3.3,
      },
      // 6. Long calm horizon — five small loops, low amp, peaceful.
      {
        crestD: 'M -50 0 C -44 -4 -38 -5 -32 -1 C -26 3 -22 4 -16 0 C -10 -4 -6 -5 0 -1 C 6 3 10 4 16 0 C 22 -4 26 -5 32 -1 C 38 3 44 4 50 0',
        halfLen: 50, halfAmp: 6, weight: 2.4,
      },
      // 7. Big bold double curl — a strong wash with two heavy lobes.
      {
        crestD: 'M -28 0 C -20 -14 -8 -14 -2 -3 C 4 7 12 8 18 0 C 24 -7 28 -5 28 -2',
        halfLen: 28, halfAmp: 14, weight: 3.7,
      },
      // 8. Tiny coil — almost a treble-clef squiggle.
      {
        crestD: 'M -12 0 C -8 -7 -2 -8 0 -2 C 2 5 8 6 12 1',
        halfLen: 12, halfAmp: 7, weight: 2.3,
      },
      // 9. Two-cycle confident "~" with deeper troughs.
      {
        crestD: 'M -28 0 C -22 -10 -14 -11 -8 -2 C -2 8 4 9 10 1 C 16 -7 22 -7 28 0',
        halfLen: 28, halfAmp: 11, weight: 3.0,
      },
      // 10. Off-axis flowing curl — drifts down at the right end.
      {
        crestD: 'M -30 0 C -22 -8 -14 -9 -8 -1 C -2 7 4 8 12 2 C 20 -3 26 0 30 6',
        halfLen: 30, halfAmp: 9, weight: 3.1,
      },
      // 11. Spiral-style triple loop — every other lobe inverted.
      {
        crestD: 'M -32 0 C -26 -8 -18 -10 -14 -2 C -10 7 -4 8 0 1 C 4 -6 10 -8 16 0 C 22 8 28 7 32 1',
        halfLen: 32, halfAmp: 10, weight: 3.0,
      },
      // 12. Choppy short three-loop — closely-spaced little lobes.
      {
        crestD: 'M -22 0 C -18 -7 -12 -8 -8 -1 C -4 6 0 6 4 0 C 8 -6 14 -7 18 -1 C 21 4 22 4 22 4',
        halfLen: 22, halfAmp: 8, weight: 2.8,
      },
    ];

    /**
     * Sea palette. Each colour is paired with an "echo" colour for the
     * faint shadow line that sits behind the main crest. Using a small
     * but real palette gives the page a sense of varied depth and light
     * across the surface.
     */
    type Palette = { main: string; echo: string; foam: string };
    const SEA_PALETTES: Palette[] = [
      { main: '#5BB8E8', echo: '#7AC8F0', foam: '#FFFFFF' }, // sky blue (brand)
      { main: '#3A8AB8', echo: '#5AA8D8', foam: '#E8F5FB' }, // deeper teal
      { main: '#7AC8E8', echo: '#A8DDEE', foam: '#FFFFFF' }, // sea-foam
      { main: '#1F4E7A', echo: '#3A6E94', foam: '#CFE6F4' }, // navy depth
      { main: '#2E91C2', echo: '#5BB8E8', foam: '#FFFFFF' }, // mid blue
      { main: '#0A1128', echo: '#1F4E7A', foam: '#CFE6F4' }, // brand deep navy
    ];

    let lastFormIdx = -1;
    let lastPaletteIdx = -1;

    const pickForm = (preferLarge: boolean = false): Form => {
      // When preferLarge (scroll-driven), bias selection toward the
      // bigger-amp / longer forms (#6, #7, #10) to make the open-sea
      // feeling on scroll really land.
      let idx: number;
      if (preferLarge && Math.random() < 0.6) {
        const big = [5, 6, 9]; // 0-indexed: forms 6, 7, 10
        idx = big[Math.floor(Math.random() * big.length)];
      } else {
        idx = Math.floor(Math.random() * WAVE_FORMS.length);
      }
      if (idx === lastFormIdx) idx = (idx + 1) % WAVE_FORMS.length;
      lastFormIdx = idx;
      return WAVE_FORMS[idx];
    };

    const pickPalette = (): Palette => {
      // All sea tones — no warm/yellow accents. Even distribution so
      // the surface reads as natural water (sky blue dominant, with
      // teal / sea-foam / navy variations underneath).
      let idx = Math.floor(Math.random() * SEA_PALETTES.length);
      if (idx === lastPaletteIdx) idx = (idx + 1) % SEA_PALETTES.length;
      lastPaletteIdx = idx;
      return SEA_PALETTES[idx];
    };

    /**
     * Spawn one wave fragment.
     *   - anchor (x, y) is the disturbed surface point
     *   - mDir (dx, dy) is the direction the disturbance travels
     *   - opts.preferLarge biases form selection toward bigger swells
     *   - opts.scaleBoost multiplies the chosen form's natural scale
     */
    const spawnWave = (
      anchorX: number,
      anchorY: number,
      mDirX: number,
      mDirY: number,
      opts: { preferLarge?: boolean; scaleBoost?: number; lifeBoost?: number } = {}
    ) => {
      const form = pickForm(opts.preferLarge);
      const palette = pickPalette();

      // Wave's long axis is laid PERPENDICULAR to the motion line —
      // each ripple becomes a curly band of disturbed water across
      // the wake, like the line a hull leaves behind it. A small
      // random tilt (±10°) breaks the perfect orthogonal so the trail
      // looks like real water, not a stamped pattern.
      const wobbleDeg = (Math.random() - 0.5) * 20;
      const angleDeg = Math.atan2(mDirY, mDirX) * (180 / Math.PI) + 90 + wobbleDeg;

      // Per-spawn scale variation. Pointer waves: 0.85..1.25. Scroll
      // waves can additionally take a scaleBoost so individual swells
      // feel large and oceanic.
      const baseScale = 0.85 + Math.random() * 0.4;
      const scale = baseScale * (opts.scaleBoost ?? 1);

      const svgWidth = (form.halfLen * 2 + 8) * scale;
      const svgHeight = (form.halfAmp * 6 + 4) * scale;

      const wave = document.createElement('div');
      wave.className = 'absolute pointer-events-none';
      wave.style.left = `${anchorX}px`;
      wave.style.top = `${anchorY}px`;
      wave.style.willChange = 'transform, opacity';
      wave.style.transform = `translate(-50%, -50%) rotate(${angleDeg}deg) scale(${scale})`;

      // Two coaxial strokes give the painterly brush feel from the
      // reference: a wider, very translucent halo behind, and a
      // crisper main stroke on top. Both share rounded caps so the
      // ends taper softly off the page like an inked brush stroke.
      const haloWeight = (form.weight * 1.9).toFixed(2);
      const mainWeight = form.weight.toFixed(2);

      wave.innerHTML = `
        <svg
          width="${svgWidth.toFixed(1)}"
          height="${svgHeight.toFixed(1)}"
          viewBox="${-form.halfLen - 6} ${-form.halfAmp - 6} ${form.halfLen * 2 + 12} ${form.halfAmp * 2 + 12}"
          xmlns="http://www.w3.org/2000/svg"
          overflow="visible"
        >
          <path d="${form.crestD}" fill="none" stroke="${palette.echo}" stroke-width="${haloWeight}" stroke-linecap="round" stroke-linejoin="round" opacity="0.22" />
          <path d="${form.crestD}" fill="none" stroke="${palette.main}" stroke-width="${mainWeight}" stroke-linecap="round" stroke-linejoin="round" opacity="0.95" />
        </svg>
      `;

      trailLayer.appendChild(wave);

      // Drift back along the motion line. Scroll waves drift further
      // (lifeBoost) so they read as a continuous moving surface.
      const pushBase = 14 + Math.random() * 10;
      const pushBack = pushBase * (opts.lifeBoost ?? 1);
      const driftX = -mDirX * pushBack;
      const driftY = -mDirY * pushBack;

      gsap.fromTo(
        wave,
        { opacity: 0 },
        { opacity: 1, duration: 0.22, ease: 'power2.out' }
      );

      gsap.to(wave, {
        x: driftX,
        y: driftY,
        scale: scale * (1.18 + Math.random() * 0.12),
        opacity: 0,
        duration: (1.4 + Math.random() * 0.4) * (opts.lifeBoost ?? 1),
        delay: 0.08,
        ease: 'sine.out',
        onComplete: () => wave.remove(),
      });
    };

    // ───────────────────────── Pointer-driven waves ─────────────────────────

    const moveTo = (x: number, y: number) => {
      const dx = x - lastX;
      const dy = y - lastY;
      const dist = Math.hypot(dx, dy);

      if (initialized && dist > 0.5) {
        dirX = dx / dist;
        dirY = dy / dist;

        const dxFromTrail = x - lastTrailX;
        const dyFromTrail = y - lastTrailY;
        const distFromTrail = Math.hypot(dxFromTrail, dyFromTrail);

        // Slightly tighter cadence so the disturbed surface feels
        // alive, but not so dense that waves visually overlap.
        if (distFromTrail > 18) {
          // Anchor the primary wake ~12px BEHIND the cursor along the
          // motion line — feels like the wake of an invisible hull
          // moving through water, not a wave painted under the
          // cursor.
          const trailOffset = 12;
          const anchorX = x - dirX * trailOffset;
          const anchorY = y - dirY * trailOffset;
          spawnWave(anchorX, anchorY, dirX, dirY);

          // Occasionally emit a SECOND, smaller wave a bit further
          // behind to give the wake layered "real water" texture.
          if (Math.random() < 0.45) {
            const echoOff = trailOffset + 8 + Math.random() * 6;
            spawnWave(
              x - dirX * echoOff,
              y - dirY * echoOff,
              dirX,
              dirY,
              { scaleBoost: 0.6 }
            );
          }

          lastTrailX = x;
          lastTrailY = y;
        }
      } else if (!initialized) {
        lastTrailX = x;
        lastTrailY = y;
      }

      lastX = x;
      lastY = y;
      initialized = true;
    };

    const onMove = (e: MouseEvent) => moveTo(e.clientX, e.clientY);

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      lastTrailX = t.clientX;
      lastTrailY = t.clientY;
      lastX = t.clientX;
      lastY = t.clientY;
      initialized = false;
      moveTo(t.clientX, t.clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      moveTo(t.clientX, t.clientY);
    };

    // Pointer-only wake. Scrolling does not generate ripples — the
    // wake should ALWAYS feel like it follows the user's hand, not
    // appear scattered across the page.

    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      while (trailLayer.firstChild) trailLayer.removeChild(trailLayer.firstChild);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]" aria-hidden="true">
      <div
        ref={trailLayerRef}
        className="absolute inset-0 pointer-events-none"
        data-testid="cursor-wake-trail"
      />
    </div>
  );
}
