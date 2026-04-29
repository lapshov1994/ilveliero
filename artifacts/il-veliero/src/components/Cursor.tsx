import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import shipLogoUrl from '@assets/sailing-ship-silhouette-000000-xl_1777459411002.png';

/**
 * Cursor — the user's pointer (or finger on touch) becomes a tiny gold
 * sailing ship. By default the ship is alone on the page; only as it moves
 * does it start leaving a soft, animated wake of waves behind it. Each wake
 * segment is heavily randomised — segment count, amplitude, length, colour
 * tint, stroke width, opacity, rotation jitter, drift distance and lifetime
 * are all sampled per-spawn — so two consecutive waves never look identical.
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

    const rand = (min: number, max: number) => min + Math.random() * (max - min);

    /** Three subtly different sky-blue tints so successive waves don't feel
     *  cloned. All are within the brand palette. */
    const WAVE_COLORS = ['#5BB8E8', '#7AC8F0', '#8FD2F2', '#B3E0F5'];

    /**
     * Spawn one wave segment in the ship's wake. Heavy randomisation across
     * length, amplitude, segment count, asymmetry, colour, opacity, stroke
     * width, rotation jitter, drift vector and lifetime so each ripple is
     * visibly unique.
     */
    const spawnWave = (x: number, y: number, dirX: number, dirY: number) => {
      const wave = document.createElement('div');
      wave.className = 'absolute pointer-events-none';
      wave.style.left = `${x}px`;
      wave.style.top = `${y}px`;
      wave.style.willChange = 'transform, opacity';

      // Base orientation — perpendicular to motion — plus random jitter so
      // the wake doesn't look like a stamped-out arc.
      const baseAngleDeg = Math.atan2(dirY, dirX) * (180 / Math.PI) + 90;
      const angleJitter = rand(-22, 22);
      const angleDeg = baseAngleDeg + angleJitter;

      const initialScale = rand(0.55, 0.95);
      wave.style.transform = `translate(-50%, -50%) rotate(${angleDeg}deg) scale(${initialScale})`;

      // Vary geometry per wave.
      const length = rand(28, 86);
      const amp = rand(1.2, 4.6);
      const segments = 2 + Math.floor(Math.random() * 3); // 2..4
      const stepX = length / segments;

      // Build a smooth quadratic-Bezier sine-ish path with per-segment
      // amplitude jitter so the curve isn't a perfectly regular sine.
      let d = `M ${-length / 2} 0`;
      for (let i = 0; i < segments; i++) {
        const cpX = -length / 2 + stepX * (i + 0.5) + rand(-stepX * 0.15, stepX * 0.15);
        const segAmp = amp * rand(0.55, 1.25);
        const cpY = i % 2 === 0 ? -segAmp : segAmp;
        const endX = -length / 2 + stepX * (i + 1);
        d += ` Q ${cpX.toFixed(2)} ${cpY.toFixed(2)} ${endX.toFixed(2)} 0`;
      }

      const color = WAVE_COLORS[Math.floor(Math.random() * WAVE_COLORS.length)];
      const stroke1 = rand(0.9, 1.7).toFixed(2);
      const stroke2 = rand(0.5, 1.0).toFixed(2);
      const op1 = rand(0.55, 0.95).toFixed(2);
      const op2 = rand(0.18, 0.5).toFixed(2);
      const yShadow = rand(2, 5).toFixed(1);
      // Sometimes skip the secondary echo for variety.
      const drawEcho = Math.random() > 0.25;

      wave.innerHTML = `
        <svg width="${length + 8}" height="${amp * 5}" viewBox="${-length / 2 - 4} ${-amp * 2.5} ${length + 8} ${amp * 5}" xmlns="http://www.w3.org/2000/svg" overflow="visible">
          <path d="${d}" fill="none" stroke="${color}" stroke-width="${stroke1}" stroke-linecap="round" opacity="${op1}" />
          ${drawEcho ? `<path d="${d}" fill="none" stroke="${color}" stroke-width="${stroke2}" stroke-linecap="round" opacity="${op2}" transform="translate(0, ${yShadow})" />` : ''}
        </svg>
      `;

      trailLayer.appendChild(wave);

      // Drift away from the ship — magnitude and direction both jittered.
      const driftMag = rand(10, 36);
      const lateralJitter = rand(-10, 10);
      const driftX = -dirX * driftMag + lateralJitter * (1 - Math.abs(dirX));
      const driftY = -dirY * driftMag + lateralJitter * (1 - Math.abs(dirY));
      const finalScale = initialScale + rand(0.3, 0.9);
      const finalRotation = angleDeg + rand(-12, 12);
      const lifetime = rand(1.1, 2.2);
      const fadeInDur = rand(0.18, 0.32);

      gsap.fromTo(
        wave,
        { opacity: 0 },
        { opacity: 1, duration: fadeInDur, ease: 'power2.out' }
      );

      gsap.to(wave, {
        x: driftX,
        y: driftY,
        rotation: finalRotation - angleDeg, // additive on top of inline rotate
        scale: finalScale,
        opacity: 0,
        duration: lifetime,
        delay: rand(0.05, 0.18),
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

      if (initialized && dist > 0) {
        const dirX = dx / dist;
        const dirY = dy / dist;

        const dxFromTrail = x - lastTrailX;
        const dyFromTrail = y - lastTrailY;
        const distFromTrail = Math.hypot(dxFromTrail, dyFromTrail);

        // Random per-spawn distance threshold so the wake doesn't pulse at a
        // mechanical pixel cadence.
        const threshold = 18 + Math.random() * 18;

        if (distFromTrail > threshold) {
          // Anchor the wave just behind the hull, with a small random offset.
          const trailOffset = rand(8, 14);
          const sideJitter = rand(-3, 3);
          const anchorX = x - dirX * trailOffset + (-dirY) * sideJitter;
          const anchorY = y - dirY * trailOffset + 5 + dirX * sideJitter;
          spawnWave(anchorX, anchorY, dirX, dirY);

          // Occasionally emit a tiny secondary droplet for extra texture.
          if (Math.random() < 0.35) {
            const j2 = rand(-6, 6);
            spawnWave(
              anchorX + j2,
              anchorY + rand(-2, 4),
              dirX + rand(-0.2, 0.2),
              dirY + rand(-0.2, 0.2)
            );
          }

          lastTrailX = x;
          lastTrailY = y;
        }
      } else {
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
      const cooldown = 90 + Math.random() * 80;
      if (now - lastScrollTrailAt < cooldown) return;
      lastScrollTrailAt = now;
      const x = lastX || window.innerWidth / 2;
      const y = lastY || window.innerHeight / 2;
      const dirY = dy > 0 ? 1 : -1;
      spawnWave(x + rand(-8, 8), y + dirY * 4, rand(-0.2, 0.2), dirY);
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
