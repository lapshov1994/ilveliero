import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import shipLogoUrl from '@assets/sailing-ship-silhouette-000000-xl_1777459411002.png';

/**
 * Cursor — the user's pointer (or finger on touch) becomes a tiny gold
 * sailing ship. A wide, sky-blue wave wake stretches out under and behind
 * the ship, and the ship leaves a fading trail of wake particles in its
 * path so it visibly looks as if the ship is sailing across the page.
 *
 * Visible on mobile too: touchstart/touchmove keep the ship under the
 * finger, touchend triggers the same idle-fade as mouse inactivity.
 */
export default function Cursor() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const shipRef = useRef<HTMLDivElement>(null);
  const wavesRef = useRef<SVGSVGElement>(null);
  const splashRef = useRef<SVGCircleElement>(null);
  const trailLayerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const ship = shipRef.current;
    const waves = wavesRef.current;
    const trailLayer = trailLayerRef.current;
    if (!wrap || !ship || !waves || !trailLayer) return;

    let idleTimer: ReturnType<typeof setTimeout> | null = null;
    let lastX = 0;
    let lastY = 0;
    let lastTrailAt = 0;
    let lastTrailX = 0;
    let lastTrailY = 0;
    let initialized = false;

    // Quick setters for low-latency follower
    const setX = gsap.quickTo(wrap, 'x', { duration: 0.18, ease: 'power3.out' });
    const setY = gsap.quickTo(wrap, 'y', { duration: 0.18, ease: 'power3.out' });

    // Continuous gentle rocking of the ship
    const rockTween = gsap.to(ship, {
      rotation: 5,
      duration: 1.4,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
      transformOrigin: 'center bottom',
    });

    // Subtle vertical bob
    const bobTween = gsap.to(ship, {
      y: -2,
      duration: 1.4,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    });

    // Waves wobble independently, slightly out of phase with the ship
    const waveTween = gsap.to(waves, {
      y: 1.6,
      duration: 1.0,
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
     * Spawn a single wake droplet at (x, y). Each droplet is a small SVG
     * arc that fades and scales while drifting slightly outward, so the
     * eye reads them as a continuous wake left behind by the ship.
     */
    const spawnWakeDroplet = (x: number, y: number, dirX: number, dirY: number) => {
      const droplet = document.createElement('div');
      droplet.className = 'absolute pointer-events-none';
      droplet.style.left = `${x}px`;
      droplet.style.top = `${y}px`;
      droplet.style.transform = 'translate(-50%, -50%)';
      droplet.style.willChange = 'transform, opacity';

      // Random arc length and curvature for variety
      const length = 18 + Math.random() * 18;
      const curve = (Math.random() - 0.5) * 8;

      droplet.innerHTML = `
        <svg width="${length + 6}" height="14" viewBox="0 0 ${length + 6} 14" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M3 7 Q ${length / 2} ${7 + curve} ${length} 7"
            fill="none"
            stroke="#5BB8E8"
            stroke-width="1.4"
            stroke-linecap="round"
            opacity="0.9"
          />
        </svg>
      `;

      trailLayer.appendChild(droplet);

      // Drift slightly opposite to the ship's motion (the wake stays where
      // the ship was) and fade out.
      const driftX = -dirX * (12 + Math.random() * 18);
      const driftY = -dirY * (12 + Math.random() * 18) + (Math.random() - 0.5) * 6;

      gsap.fromTo(
        droplet,
        { opacity: 0.85, scale: 0.6 },
        {
          opacity: 0,
          scale: 1.6,
          x: driftX,
          y: driftY,
          duration: 1.4 + Math.random() * 0.5,
          ease: 'sine.out',
          onComplete: () => droplet.remove(),
        }
      );
    };

    const moveTo = (x: number, y: number) => {
      setX(x);
      setY(y);

      // Determine motion direction (unit vector)
      const dx = x - lastX;
      const dy = y - lastY;
      const dist = Math.hypot(dx, dy);

      if (initialized && dist > 0) {
        const dirX = dx / dist;
        const dirY = dy / dist;

        // Throttle droplets — emit one only when the ship has moved at
        // least ~22px since the last droplet, so we don't drown the page
        // in wake noise on tiny micro-movements.
        const dxFromLastTrail = x - lastTrailX;
        const dyFromLastTrail = y - lastTrailY;
        const distFromLastTrail = Math.hypot(dxFromLastTrail, dyFromLastTrail);

        if (distFromLastTrail > 22) {
          // Anchor droplet just behind the hull (slightly opposite the
          // motion direction).
          const anchorX = x - dirX * 8;
          const anchorY = y - dirY * 6 + 4; // small bias under the hull
          spawnWakeDroplet(anchorX, anchorY, dirX, dirY);
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

    // Touch handlers — make the ship ride the user's finger on mobile.
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      // Reset trail anchor on a fresh touch so we don't draw a long line
      // jumping from the previous touch.
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

    // Scroll also leaves a trail — droplets emanate downward when scrolling
    // down, upward when scrolling up.
    let lastScrollY = window.scrollY;
    const onScroll = () => {
      const dy = window.scrollY - lastScrollY;
      lastScrollY = window.scrollY;
      if (Math.abs(dy) < 6) return;
      // Throttle scroll droplets
      const now = performance.now();
      if (now - lastTrailAt < 80) return;
      lastTrailAt = now;
      const x = lastX || window.innerWidth / 2;
      const y = lastY || window.innerHeight / 2;
      const dirY = dy > 0 ? 1 : -1;
      spawnWakeDroplet(x, y + dirY * 4, 0, dirY);
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

    const onClick = () => {
      if (!splashRef.current) return;
      gsap.fromTo(
        splashRef.current,
        { attr: { r: 4 }, opacity: 0.7 },
        { attr: { r: 80 }, opacity: 0, duration: 0.9, ease: 'power2.out' }
      );
      gsap.fromTo(
        waves,
        { scaleX: 1, scaleY: 1 },
        { scaleX: 1.2, scaleY: 1.4, duration: 0.28, yoyo: true, repeat: 1, ease: 'power2.out', transformOrigin: 'center top' }
      );
      reveal();
      scheduleHide();
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('click', onClick);
    window.addEventListener('mouseout', onMouseOut);
    window.addEventListener('blur', onBlur);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchcancel', onTouchEnd);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('click', onClick);
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
      waveTween.kill();
      // Clean up any droplets still in flight
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
          // Anchor: middle of ship hull (where it meets the waves)
          transform: 'translate3d(0,0,0) translate(-50%, -85%)',
          willChange: 'transform, opacity',
        }}
      >
        {/* Ship silhouette in gold */}
        <div
          ref={shipRef}
          className="relative"
          style={{
            width: '34px',
            height: '38px',
          }}
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

        {/* Wave wake drawn on the screen plane directly under the hull. */}
        <svg
          ref={wavesRef}
          width="160"
          height="36"
          viewBox="0 0 160 36"
          className="absolute left-1/2 -translate-x-1/2 -bottom-5"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle ref={splashRef} cx="80" cy="14" r="4" fill="none" stroke="#5BB8E8" strokeWidth="1.4" opacity="0" />
          {/* Foreground wave — strongest, longest */}
          <path
            d="M4 14 Q14 9 24 14 T44 14 T64 14 T84 14 T104 14 T124 14 T144 14 T156 14"
            fill="none"
            stroke="#5BB8E8"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.95"
          />
          {/* Mid wave */}
          <path
            d="M8 22 Q20 17 32 22 T56 22 T80 22 T104 22 T128 22 T152 22"
            fill="none"
            stroke="#5BB8E8"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.7"
          />
          {/* Far wave — softest, faintest */}
          <path
            d="M14 30 Q28 26 42 30 T70 30 T98 30 T126 30 T148 30"
            fill="none"
            stroke="#5BB8E8"
            strokeWidth="1.1"
            strokeLinecap="round"
            opacity="0.4"
          />
        </svg>
      </div>
    </div>
  );
}
