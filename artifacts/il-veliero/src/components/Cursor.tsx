import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import shipLogoUrl from '@assets/sailing-ship-silhouette-000000-xl_1777459411002.png';

/**
 * Cursor — the user's pointer (or finger on touch) becomes a tiny gold
 * sailing ship. By default the ship is alone on the page; only as it moves
 * does it start leaving a soft, animated wake of waves behind it. The wake
 * waves are drawn as SVG sine paths whose own internal dasharray animates
 * gently so each ripple breathes in place before it fades.
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

    // Quick setters for low-latency follower
    const setX = gsap.quickTo(wrap, 'x', { duration: 0.18, ease: 'power3.out' });
    const setY = gsap.quickTo(wrap, 'y', { duration: 0.18, ease: 'power3.out' });

    // Continuous gentle rocking & bobbing of the ship itself
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
     * Spawn one wave segment in the ship's wake. Each wave is an SVG sine
     * curve with three light dasharray-animated bands so it visibly ripples
     * for a brief moment before fading out and drifting opposite to motion.
     */
    const spawnWave = (x: number, y: number, dirX: number, dirY: number) => {
      const wave = document.createElement('div');
      wave.className = 'absolute pointer-events-none';
      wave.style.left = `${x}px`;
      wave.style.top = `${y}px`;
      wave.style.willChange = 'transform, opacity';

      // Orient the wave perpendicular-ish to motion so it reads as a wake
      // ring fanning out under the hull.
      const angleDeg = Math.atan2(dirY, dirX) * (180 / Math.PI);
      // Translate -50% to anchor the wave center; rotate so its long axis is
      // perpendicular to the motion vector.
      wave.style.transform = `translate(-50%, -50%) rotate(${angleDeg + 90}deg)`;

      // Random gentle variations so successive waves don't look stamped.
      const length = 46 + Math.random() * 20;
      const amp = 2.2 + Math.random() * 1.8;
      const segments = 3;
      const stepX = length / segments;

      // Build a smooth quadratic-Bezier sine path.
      let d = `M ${-length / 2} 0`;
      for (let i = 0; i < segments; i++) {
        const cpX = -length / 2 + stepX * (i + 0.5);
        const cpY = i % 2 === 0 ? -amp : amp;
        const endX = -length / 2 + stepX * (i + 1);
        d += ` Q ${cpX} ${cpY} ${endX} 0`;
      }

      wave.innerHTML = `
        <svg width="${length + 6}" height="${amp * 4}" viewBox="${-length / 2 - 3} ${-amp * 2} ${length + 6} ${amp * 4}" xmlns="http://www.w3.org/2000/svg" overflow="visible">
          <path d="${d}" fill="none" stroke="#5BB8E8" stroke-width="1.4" stroke-linecap="round" opacity="0.9" />
          <path d="${d}" fill="none" stroke="#5BB8E8" stroke-width="0.9" stroke-linecap="round" opacity="0.5" transform="translate(0,3)" />
        </svg>
      `;

      trailLayer.appendChild(wave);

      // Wake drifts a little away from the ship as it ages, and rocks once
      // before fading. We separate the lifecycle into two overlapping tweens:
      // (a) a brief amplitude pulse, (b) a slower drift+fade.
      const drift = 14 + Math.random() * 14;
      const driftX = -dirX * drift + (Math.random() - 0.5) * 6;
      const driftY = -dirY * drift + (Math.random() - 0.5) * 6;

      gsap.fromTo(
        wave,
        { opacity: 0, scale: 0.7 },
        { opacity: 1, scale: 1, duration: 0.25, ease: 'power2.out' }
      );

      gsap.to(wave, {
        x: driftX,
        y: driftY,
        scale: 1.45,
        opacity: 0,
        duration: 1.6 + Math.random() * 0.4,
        delay: 0.1,
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

        // Emit a wave only after the ship has travelled a meaningful
        // distance, so micro-jitter doesn't spam waves on screen.
        if (distFromTrail > 26) {
          // Anchor the wave just behind the hull, not under it
          const anchorX = x - dirX * 10;
          const anchorY = y - dirY * 8 + 5; // small bias under the hull
          spawnWave(anchorX, anchorY, dirX, dirY);
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
      if (now - lastScrollTrailAt < 110) return;
      lastScrollTrailAt = now;
      const x = lastX || window.innerWidth / 2;
      const y = lastY || window.innerHeight / 2;
      const dirY = dy > 0 ? 1 : -1;
      spawnWave(x, y + dirY * 4, 0, dirY);
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
      {/* Layer that holds the persistent wake droplets */}
      <div
        ref={trailLayerRef}
        className="absolute inset-0 pointer-events-none"
        data-testid="cursor-wake-trail"
      />

      <div
        ref={wrapRef}
        className="fixed top-0 left-0 opacity-0"
        style={{
          // Anchor: bottom-center of ship hull so the wake appears under it
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
