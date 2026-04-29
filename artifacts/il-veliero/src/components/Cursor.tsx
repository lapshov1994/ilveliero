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

    // Forms are flowing horizontal tildes — one, two, or three full
    // oscillations of a sine-like brush stroke that sits ON the
    // surface. Reference: classic flat ocean-ripple iconography
    // (long ~~~ doodles, tapered, painterly). All amplitudes are
    // symmetric around y=0, so the wave reads as a flat sea line.
    const WAVE_FORMS: Form[] = [
      // 1. Single full tilde (one up-down cycle), medium length. Most
      //    common form — the "default ripple".
      {
        crestD: 'M -22 0 Q -14 -7 -7 -1 Q 0 6 7 1 Q 14 -6 22 0',
        halfLen: 22, halfAmp: 8, weight: 3.2,
      },
      // 2. Long flowing two-and-a-half cycle ripple (the big ~~~).
      {
        crestD: 'M -42 0 Q -34 -6 -26 -1 Q -18 5 -10 0 Q -2 -6 6 -1 Q 14 5 22 0 Q 30 -5 42 0',
        halfLen: 42, halfAmp: 7, weight: 2.8,
      },
      // 3. Short single bump — a quick crest, used for micro-moves.
      {
        crestD: 'M -14 0 Q -7 -6 0 0 Q 7 6 14 0',
        halfLen: 14, halfAmp: 7, weight: 2.6,
      },
      // 4. Wide gentle one-and-a-half cycle.
      {
        crestD: 'M -32 0 Q -22 -6 -12 0 Q -2 6 8 0 Q 18 -6 32 0',
        halfLen: 32, halfAmp: 7, weight: 3.0,
      },
      // 5. Asymmetric long swell — bigger left crest, smaller right.
      {
        crestD: 'M -36 0 Q -26 -10 -14 -2 Q -2 8 8 1 Q 18 -4 36 0',
        halfLen: 36, halfAmp: 11, weight: 3.4,
      },
      // 6. LONG calm horizon — three small cycles, low amplitude.
      {
        crestD: 'M -48 0 Q -40 -4 -32 0 Q -24 4 -16 0 Q -8 -4 0 0 Q 8 4 16 0 Q 24 -4 32 0 Q 40 4 48 0',
        halfLen: 48, halfAmp: 5, weight: 2.4,
      },
      // 7. Big bold single crest — a strong wash.
      {
        crestD: 'M -28 0 Q -14 -12 0 0 Q 14 12 28 0',
        halfLen: 28, halfAmp: 13, weight: 4.0,
      },
      // 8. Tiny dash — almost a comma, thinnest stroke.
      {
        crestD: 'M -10 0 Q -3 -4 4 -1 Q 8 0 10 1',
        halfLen: 10, halfAmp: 5, weight: 2.2,
      },
      // 9. Two-cycle medium tilde — a confident "~~".
      {
        crestD: 'M -28 0 Q -20 -7 -12 -1 Q -4 5 4 0 Q 12 -6 20 0 Q 26 4 28 1',
        halfLen: 28, halfAmp: 8, weight: 3.0,
      },
      // 10. Off-axis flowing curl — drops at the right end, brush-stroke feel.
      {
        crestD: 'M -30 0 Q -22 -6 -12 -2 Q -2 4 8 0 Q 18 -4 26 2 Q 30 4 32 6',
        halfLen: 30, halfAmp: 8, weight: 3.2,
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

      // Wave's long axis ALONG the motion direction — each ripple
      // becomes a tilde laid down ON the finger's path, so the trail
      // reads as a stream of waves following the finger, not as
      // sidelong sea-lines being cut by it.
      const angleDeg = Math.atan2(mDirY, mDirX) * (180 / Math.PI);

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
