import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Cursor — there is NO visible cursor sprite. Instead, the user's pointer
 * silently disturbs the surface of the sea: every meaningful move spawns
 * one or two ripples that drift backwards along the motion line and
 * dissipate. Vertical scroll independently disturbs the sea across the
 * full width of the viewport, so both pointer and scroll feel like they
 * touch water.
 *
 * Design notes:
 *   - No ship, no mascot, no hard "cursor" object — the surface itself
 *     is the cursor.
 *   - Waves come in many shapes (gentle arcs, choppy crests, long
 *     swells, foam-tipped curls, splash-rings) and many tones (deep
 *     navy, sky blue, sea-foam, warm gold) so consecutive waves never
 *     read as a copy-paste pattern.
 *   - Foam dashes and tiny spray dots are sprinkled in at random for
 *     extra realism without ever turning the page into a particle
 *     storm.
 *   - Scroll-driven waves are emitted at random horizontal positions
 *     across the viewport, perpendicular to the scroll direction, and
 *     drift in the scroll direction before fading. They use the same
 *     library of wave forms but are biased towards larger swells so
 *     the page feels like an open sea, not a puddle.
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

    const WAVE_FORMS: Form[] = [
      // 1. Wide shallow arc with two pronounced bumps near the centre.
      {
        crestD: 'M -34 4 Q -24 -2 -16 -1 Q -8 -8 0 -2 Q 8 -8 16 -1 Q 24 -2 34 4',
        foamD: 'M -10 -5 L -6 -6  M 6 -6 L 10 -5',
        halfLen: 34, halfAmp: 9, weight: 1.2,
      },
      // 2. Long sweep with a single big swell.
      {
        crestD: 'M -36 5 Q -22 -1 -10 -2 Q -2 -10 8 -3 Q 18 0 36 5',
        foamD: 'M -2 -7 L 4 -8',
        halfLen: 36, halfAmp: 10, weight: 1.3,
      },
      // 3. Three short choppy crests, like fresh wash close to the hull.
      {
        crestD: 'M -28 3 Q -22 -2 -16 -3 Q -10 -7 -4 -2 Q 0 -8 6 -3 Q 12 -8 18 -3 Q 24 -2 28 3',
        foamD: 'M -16 -5 L -12 -6  M 4 -6 L 8 -7  M 16 -5 L 20 -6',
        halfLen: 28, halfAmp: 8, weight: 1.0,
      },
      // 4. Asymmetric curl — heavy crest on the left.
      {
        crestD: 'M -30 5 Q -20 -3 -14 -4 Q -8 -11 -2 -3 Q 6 0 16 1 Q 24 3 30 5',
        foamD: 'M -10 -8 L -4 -7',
        halfLen: 30, halfAmp: 11, weight: 1.2,
      },
      // 5. Gentle low spread with subtle double dip — calm wake.
      {
        crestD: 'M -32 2 Q -22 -1 -14 -2 Q -6 -5 0 -2 Q 6 -5 14 -2 Q 22 -1 32 2',
        halfLen: 32, halfAmp: 5, weight: 0.9,
      },
      // 6. LONG open-sea swell — wide, very low amplitude, single graceful crest.
      {
        crestD: 'M -56 4 Q -34 1 -16 -2 Q 0 -6 16 -2 Q 34 1 56 4',
        halfLen: 56, halfAmp: 8, weight: 1.5,
      },
      // 7. Big asymmetric breaker — a long dropping curve with foam scatter.
      {
        crestD: 'M -48 6 Q -28 1 -10 -3 Q 0 -10 12 -4 Q 26 0 48 7',
        foamD: 'M -6 -8 L 0 -9  M 4 -8 L 10 -9',
        halfLen: 48, halfAmp: 12, weight: 1.4,
      },
      // 8. Spray ring — a near-flat baseline plus a constellation of tiny dots above it.
      {
        crestD: 'M -22 1 Q -10 -2 0 -2 Q 10 -2 22 1',
        sprayDots: [
          { x: -12, y: -7, r: 0.8 },
          { x: -4, y: -10, r: 1.0 },
          { x: 3, y: -9, r: 0.7 },
          { x: 10, y: -7, r: 0.9 },
          { x: -1, y: -12, r: 0.6 },
        ],
        halfLen: 22, halfAmp: 12, weight: 0.9,
      },
      // 9. Tiny ripple — a delicate near-sine, very low amplitude. Used for
      //    pointer micro-motion so subtle moves still leave a trace.
      {
        crestD: 'M -16 1 Q -8 -1 0 -2 Q 8 -1 16 1',
        halfLen: 16, halfAmp: 3, weight: 0.7,
      },
      // 10. Twin crest — two equal swells separated by a calm trough.
      {
        crestD: 'M -38 3 Q -28 0 -22 -1 Q -16 -7 -10 -2 Q -2 0 2 0 Q 8 0 10 -2 Q 16 -7 22 -1 Q 28 0 38 3',
        foamD: 'M -12 -5 L -8 -6  M 8 -6 L 12 -5',
        halfLen: 38, halfAmp: 8, weight: 1.2,
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
      { main: '#D4AF37', echo: '#E8C45A', foam: '#FFF6D6' }, // warm gold (rare — sun-glint)
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
      // Gold is rare (≈1 in 12) so it reads as a special highlight not
      // the dominant tone.
      if (Math.random() < 0.08) return SEA_PALETTES[5];
      let idx = Math.floor(Math.random() * 5); // 0..4 — non-gold
      if (idx === lastPaletteIdx) idx = (idx + 1) % 5;
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

      // Wave's long axis perpendicular to motion direction.
      const angleDeg = Math.atan2(mDirY, mDirX) * (180 / Math.PI) + 90;

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

      const echoWeight = (form.weight * 0.6).toFixed(2);
      const mainWeight = form.weight.toFixed(2);

      const foamMarkup = form.foamD
        ? `<path d="${form.foamD}" fill="none" stroke="${palette.foam}" stroke-width="0.85" stroke-linecap="round" opacity="0.6" />`
        : '';

      const sprayMarkup = form.sprayDots
        ? form.sprayDots
            .map((d) => `<circle cx="${d.x}" cy="${d.y}" r="${d.r}" fill="${palette.foam}" opacity="0.65" />`)
            .join('')
        : '';

      wave.innerHTML = `
        <svg
          width="${svgWidth.toFixed(1)}"
          height="${svgHeight.toFixed(1)}"
          viewBox="${-form.halfLen - 6} ${-form.halfAmp - 4} ${form.halfLen * 2 + 12} ${form.halfAmp * 2 + 12}"
          xmlns="http://www.w3.org/2000/svg"
          overflow="visible"
        >
          <path d="${form.crestD}" fill="none" stroke="${palette.echo}" stroke-width="${echoWeight}" stroke-linecap="round" opacity="0.45" transform="translate(0.6, 2.4)" />
          <path d="${form.crestD}" fill="none" stroke="${palette.main}" stroke-width="${mainWeight}" stroke-linecap="round" stroke-linejoin="round" opacity="0.92" />
          ${foamMarkup}
          ${sprayMarkup}
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
