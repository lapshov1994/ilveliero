import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import shipLogoUrl from '@assets/sailing-ship-silhouette-000000-xl_1777459411002.png';

/**
 * Cursor — the user's pointer becomes a tiny gold sailing ship. By default
 * the ship is alone on the page; only as it moves does it begin to leave a
 * wake.
 *
 * Wake design (per latest feedback):
 *   - The wake is a true KILVATER: every ripple sits directly behind the
 *     hull on the line of motion, never to the side, never rotated for
 *     visual variety.
 *   - Each ripple is rotated only to align its long axis perpendicular to
 *     motion (so the wave reads as a wave, not as a streak), but never with
 *     extra "decorative" jitter.
 *   - Five hand-picked sine-shaped wave forms are randomly rotated through.
 *     They differ in length and amplitude, but every form is unmistakably
 *     a wave — no spirals, no asymmetric shapes, no chaos.
 *   - Ripples fade out gently in place with only a small straight push
 *     further behind the ship along the motion line. They do not drift
 *     sideways and they do not spin.
 */
export default function Cursor() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const shipRef = useRef<HTMLDivElement>(null);
  const trailLayerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const ship = shipRef.current;
    const trailLayer = trailLayerRef.current;
    if (!wrap || !ship || !trailLayer) return;

    let idleTimer: ReturnType<typeof setTimeout> | null = null;
    let lastX = 0;
    let lastY = 0;
    let lastTrailX = 0;
    let lastTrailY = 0;
    let lastScrollTrailAt = 0;
    let initialized = false;
    // Persistent direction of travel — used so ripples emitted on micro-stops
    // still align with the last meaningful motion.
    let dirX = 0;
    let dirY = 1;

    const setX = gsap.quickTo(wrap, 'x', { duration: 0.18, ease: 'power3.out' });
    const setY = gsap.quickTo(wrap, 'y', { duration: 0.18, ease: 'power3.out' });

    const rockTween = gsap.to(ship, {
      rotation: 5,
      duration: 1.6,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
      transformOrigin: 'center bottom',
    });
    const bobTween = gsap.to(ship, {
      y: -2,
      duration: 1.6,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    });

    const reveal = () => {
      gsap.killTweensOf(wrap, 'opacity');
      gsap.to(wrap, { opacity: 1, duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
    };
    const hideNow = () => {
      gsap.killTweensOf(wrap, 'opacity');
      gsap.to(wrap, { opacity: 0, duration: 0.5, ease: 'sine.in', overwrite: 'auto' });
    };
    const scheduleHide = () => {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        gsap.killTweensOf(wrap, 'opacity');
        gsap.to(wrap, { opacity: 0, duration: 1.6, ease: 'sine.in', overwrite: 'auto' });
      }, 1800);
    };

    /**
     * Five fixed wave silhouettes. All are drawn around y=0 across a fixed
     * span of ±30 units so they share a baseline visual identity but vary
     * subtly in number of crests, amplitude balance, and length so the
     * wake doesn't look mass-produced.
     *
     * Each entry exposes: the SVG path data, the half-length used for
     * positioning, and the half-amplitude used to size the SVG viewBox.
     */
    const WAVE_FORMS: { d: string; halfLen: number; halfAmp: number }[] = [
      // Form 1 — gentle two-crest wave (the "default" hotel-postcard wave)
      {
        d: 'M -30 0 Q -22.5 -3.5 -15 0 Q -7.5 3.5 0 0 Q 7.5 -3.5 15 0 Q 22.5 3.5 30 0',
        halfLen: 30,
        halfAmp: 4,
      },
      // Form 2 — slightly bigger swell, single dominant crest
      {
        d: 'M -30 0 Q -20 -2 -10 0 Q 0 4.5 10 0 Q 20 -2 30 0',
        halfLen: 30,
        halfAmp: 5,
      },
      // Form 3 — three small crests, breezier feel
      {
        d: 'M -30 0 Q -25 -2.5 -20 0 Q -15 2.5 -10 0 Q -5 -2.5 0 0 Q 5 2.5 10 0 Q 15 -2.5 20 0 Q 25 2.5 30 0',
        halfLen: 30,
        halfAmp: 3,
      },
      // Form 4 — long lazy single arc with a soft rebound
      {
        d: 'M -30 0 Q -10 -3.5 0 0 Q 10 3.5 30 0',
        halfLen: 30,
        halfAmp: 4,
      },
      // Form 5 — four tiny ripples, finely textured
      {
        d: 'M -30 0 Q -26 -1.8 -22 0 Q -18 1.8 -14 0 Q -10 -1.8 -6 0 Q -2 1.8 2 0 Q 6 -1.8 10 0 Q 14 1.8 18 0 Q 22 -1.8 26 0 Q 28 0.9 30 0',
        halfLen: 30,
        halfAmp: 2.5,
      },
    ];

    let lastFormIdx = -1;
    const pickForm = () => {
      // Avoid picking the exact same form twice in a row so consecutive
      // ripples are always at least slightly different.
      let idx = Math.floor(Math.random() * WAVE_FORMS.length);
      if (idx === lastFormIdx) idx = (idx + 1) % WAVE_FORMS.length;
      lastFormIdx = idx;
      return WAVE_FORMS[idx];
    };

    /**
     * Spawn one wave segment STRICTLY in the wake — directly behind the
     * hull, on the line of motion, oriented perpendicular to motion, and
     * with no rotational jitter or sideways drift.
     */
    const spawnWave = (anchorX: number, anchorY: number, mDirX: number, mDirY: number) => {
      const form = pickForm();

      // The wave's long axis must be perpendicular to motion. atan2 gives
      // motion angle; +90deg rotates the wave so its crest line crosses
      // the wake.
      const angleDeg = Math.atan2(mDirY, mDirX) * (180 / Math.PI) + 90;

      // Subtle uniform scale variation per spawn (0.9..1.15) so successive
      // waves look like the same wake at slightly different distances —
      // this is the ONLY size variation, kept small.
      const scale = 0.9 + Math.random() * 0.25;

      const svgWidth = (form.halfLen * 2 + 6) * scale;
      const svgHeight = form.halfAmp * 5 * scale;

      const wave = document.createElement('div');
      wave.className = 'absolute pointer-events-none';
      wave.style.left = `${anchorX}px`;
      wave.style.top = `${anchorY}px`;
      wave.style.willChange = 'transform, opacity';
      wave.style.transform = `translate(-50%, -50%) rotate(${angleDeg}deg) scale(${scale})`;

      wave.innerHTML = `
        <svg
          width="${svgWidth.toFixed(1)}"
          height="${svgHeight.toFixed(1)}"
          viewBox="${-form.halfLen - 3} ${-form.halfAmp * 2.5} ${form.halfLen * 2 + 6} ${form.halfAmp * 5}"
          xmlns="http://www.w3.org/2000/svg"
          overflow="visible"
        >
          <path d="${form.d}" fill="none" stroke="#5BB8E8" stroke-width="1.3" stroke-linecap="round" opacity="0.85" />
          <path d="${form.d}" fill="none" stroke="#7AC8F0" stroke-width="0.7" stroke-linecap="round" opacity="0.45" transform="translate(0, 2.4)" />
        </svg>
      `;

      trailLayer.appendChild(wave);

      // Small straight push further behind the ship along the motion line —
      // no perpendicular drift. This makes the trail read as a real wake
      // settling away from the hull, not as a particle effect.
      const pushBack = 14 + Math.random() * 10;
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
        // The wave settles by gently widening as it dissipates — no
        // rotation, no sideways jitter.
        scale: scale * 1.18,
        opacity: 0,
        duration: 1.4 + Math.random() * 0.3,
        delay: 0.08,
        ease: 'sine.out',
        onComplete: () => wave.remove(),
      });
    };

    const moveTo = (x: number, y: number) => {
      setX(x);
      setY(y);

      const dx = x - lastX;
      const dy = y - lastY;
      const dist = Math.hypot(dx, dy);

      if (initialized && dist > 0.5) {
        // Update the persistent direction only on meaningful motion.
        dirX = dx / dist;
        dirY = dy / dist;

        const dxFromTrail = x - lastTrailX;
        const dyFromTrail = y - lastTrailY;
        const distFromTrail = Math.hypot(dxFromTrail, dyFromTrail);

        // Fixed-ish spawn cadence so the wake reads as evenly spaced
        // ripples behind the hull rather than as a chaotic particle burst.
        if (distFromTrail > 22) {
          // Anchor each ripple ~12px directly behind the hull along motion.
          const trailOffset = 12;
          const anchorX = x - dirX * trailOffset;
          const anchorY = y - dirY * trailOffset + 4;
          spawnWave(anchorX, anchorY, dirX, dirY);
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

      reveal();
      scheduleHide();
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
    const onTouchEnd = () => scheduleHide();

    let lastScrollY = window.scrollY;
    const onScroll = () => {
      const dy = window.scrollY - lastScrollY;
      lastScrollY = window.scrollY;
      if (Math.abs(dy) < 6) return;
      const now = performance.now();
      if (now - lastScrollTrailAt < 110) return;
      lastScrollTrailAt = now;
      const x = lastX || window.innerWidth / 2;
      const y = lastY || window.innerHeight / 2;
      // Scroll wake is purely vertical, no horizontal jitter.
      const sDirY = dy > 0 ? 1 : -1;
      spawnWave(x, y + sDirY * 4, 0, sDirY);
    };

    const onMouseOut = (e: MouseEvent) => {
      if (!e.relatedTarget && !(e as MouseEvent & { toElement?: Element }).toElement) {
        if (idleTimer) clearTimeout(idleTimer);
        hideNow();
      }
    };
    const onBlur = () => {
      if (idleTimer) clearTimeout(idleTimer);
      hideNow();
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseout', onMouseOut);
    window.addEventListener('blur', onBlur);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchcancel', onTouchEnd);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseout', onMouseOut);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
      if (idleTimer) clearTimeout(idleTimer);
      gsap.killTweensOf(wrap);
      rockTween.kill();
      bobTween.kill();
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

      <div
        ref={wrapRef}
        className="fixed top-0 left-0 opacity-0"
        style={{
          transform: 'translate3d(0,0,0) translate(-50%, -85%)',
          willChange: 'transform, opacity',
        }}
      >
        <div
          ref={shipRef}
          className="relative"
          style={{ width: '34px', height: '38px' }}
        >
          <div
            className="w-full h-full"
            style={{
              backgroundColor: '#D4AF37',
              filter: 'drop-shadow(0 2px 6px rgba(212,175,55,0.35))',
              WebkitMaskImage: `url(${shipLogoUrl})`,
              WebkitMaskRepeat: 'no-repeat',
              WebkitMaskSize: 'contain',
              WebkitMaskPosition: 'center bottom',
              maskImage: `url(${shipLogoUrl})`,
              maskRepeat: 'no-repeat',
              maskSize: 'contain',
              maskPosition: 'center bottom',
            }}
          />
        </div>
      </div>
    </div>
  );
}
