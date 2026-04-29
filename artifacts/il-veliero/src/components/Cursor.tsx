import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import shipLogoUrl from '@assets/sailing-ship-silhouette-000000-xl_1777459411002.png';

/**
 * Cursor — the user's pointer (or finger on touch) becomes a tiny gold
 * sailing ship. A wide, sky-blue wave wake stretches out under and behind
 * the ship — three times longer / wider than before, still tied to the
 * ship so it always reads as "the ship's wake" on the screen plane.
 *
 * Visible on mobile too: touchstart/touchmove keep the ship under the
 * finger, touchend triggers the same idle-fade as mouse inactivity.
 */
export default function Cursor() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const shipRef = useRef<HTMLDivElement>(null);
  const wavesRef = useRef<SVGSVGElement>(null);
  const splashRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const ship = shipRef.current;
    const waves = wavesRef.current;
    if (!wrap || !ship || !waves) return;

    let idleTimer: ReturnType<typeof setTimeout> | null = null;

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

    const moveTo = (x: number, y: number) => {
      setX(x);
      setY(y);
      reveal();
      scheduleHide();
    };

    const onMove = (e: MouseEvent) => moveTo(e.clientX, e.clientY);

    // Touch handlers — make the ship ride the user's finger on mobile.
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      moveTo(t.clientX, t.clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      moveTo(t.clientX, t.clientY);
    };
    const onTouchEnd = () => scheduleHide();

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
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchcancel', onTouchEnd);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('click', onClick);
      window.removeEventListener('mouseout', onMouseOut);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
      if (idleTimer) clearTimeout(idleTimer);
      gsap.killTweensOf(wrap);
      rockTween.kill();
      bobTween.kill();
      waveTween.kill();
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]" aria-hidden="true">
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

        {/* Wave wake — three times wider than before, drawn on the screen
            plane directly under the hull. */}
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
