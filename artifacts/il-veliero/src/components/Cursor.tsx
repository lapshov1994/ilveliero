import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import shipLogoUrl from '@assets/sailing-ship-silhouette-000000-xl_1777459411002.png';

/**
 * Cursor — the user's pointer becomes a tiny gold sailing ship.
 * Below the ship a small set of sky-blue waves is generated STRICTLY
 * underneath it, on which the ship gently rocks. After ~2 seconds of
 * inactivity (no mousemove / no click) the whole composition fades out;
 * any new movement brings it back.
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

    // Continuous gentle rocking of the ship — wave-like
    const rockTween = gsap.to(ship, {
      rotation: 5,
      duration: 1.4,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
      transformOrigin: 'center bottom',
    });

    // Subtle vertical bob so the ship feels lifted by the waves
    const bobTween = gsap.to(ship, {
      y: -2,
      duration: 1.4,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    });

    // Waves wobble independently for a richer feel
    const waveTween = gsap.to(waves, {
      y: 1.4,
      duration: 1.0,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    });

    // Always cancel any in-flight opacity tween before scheduling a new
    // one so user motion can never be hidden by a stale fade-out.
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

    const onMove = (e: MouseEvent) => {
      setX(e.clientX);
      setY(e.clientY);
      reveal();
      scheduleHide();
    };

    // Robust viewport-exit detection: pointerleave on document doesn't
    // fire reliably across all browsers, so we listen to mouseout with a
    // null relatedTarget AND window blur.
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
        { attr: { r: 2 }, opacity: 0.65 },
        { attr: { r: 28 }, opacity: 0, duration: 0.7, ease: 'power2.out' }
      );
      gsap.fromTo(
        waves,
        { scaleX: 1, scaleY: 1 },
        { scaleX: 1.25, scaleY: 1.4, duration: 0.25, yoyo: true, repeat: 1, ease: 'power2.out', transformOrigin: 'center top' }
      );
      reveal();
      scheduleHide();
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('click', onClick);
    window.addEventListener('mouseout', onMouseOut);
    window.addEventListener('blur', onBlur);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('click', onClick);
      window.removeEventListener('mouseout', onMouseOut);
      window.removeEventListener('blur', onBlur);
      if (idleTimer) clearTimeout(idleTimer);
      gsap.killTweensOf(wrap);
      rockTween.kill();
      bobTween.kill();
      waveTween.kill();
    };
  }, []);

  return (
    <div className="hidden md:block pointer-events-none fixed inset-0 z-[9999]" aria-hidden="true">
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

        {/* Waves — strictly under the ship hull */}
        <svg
          ref={wavesRef}
          width="50"
          height="14"
          viewBox="0 0 50 14"
          className="absolute left-1/2 -translate-x-1/2 -bottom-3"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle ref={splashRef} cx="25" cy="6" r="2" fill="none" stroke="#5BB8E8" strokeWidth="1" opacity="0" />
          <path
            d="M2 6 Q9 3 16 6 T30 6 T44 6 T48 6"
            fill="none"
            stroke="#5BB8E8"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.95"
          />
          <path
            d="M4 11 Q12 8 20 11 T36 11 T46 11"
            fill="none"
            stroke="#5BB8E8"
            strokeWidth="1.1"
            strokeLinecap="round"
            opacity="0.55"
          />
        </svg>
      </div>
    </div>
  );
}
