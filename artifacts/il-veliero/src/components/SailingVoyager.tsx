import React, { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function SailingVoyager() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const rockRef = useRef<HTMLDivElement>(null);
  const wave1Ref = useRef<SVGPathElement>(null);
  const wave2Ref = useRef<SVGPathElement>(null);
  const wakeRef = useRef<SVGGElement>(null);
  const flagRef = useRef<SVGPathElement>(null);
  const [location] = useLocation();
  const isHome = location === '/' || location === '';

  useEffect(() => {
    if (!isHome || !wrapperRef.current) return;

    const track = document.getElementById('voyager-track');
    if (!track) return;

    let detachWake: (() => void) | null = null;

    const ctx = gsap.context(() => {
      // Hidden over hero — fade in only after the booking widget scrolls past
      const hero = document.querySelector('.hero-section');
      if (hero) {
        gsap.set(wrapperRef.current, { opacity: 0 });
        gsap.to(wrapperRef.current, {
          opacity: 0.22,
          ease: 'none',
          scrollTrigger: {
            trigger: hero,
            start: 'bottom 80%',
            end: 'bottom 20%',
            scrub: true,
          },
        });
      } else {
        gsap.set(wrapperRef.current, { opacity: 0.22 });
      }

      // Drift across the page synced with overall scroll
      gsap.to(wrapperRef.current, {
        x: '110vw',
        y: '40vh',
        rotation: 6,
        ease: 'none',
        scrollTrigger: {
          trigger: '#voyager-track',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 2,
        },
      });

      if (rockRef.current) {
        gsap.to(rockRef.current, {
          rotation: 2.5,
          duration: 3.2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          transformOrigin: '50% 70%',
        });
        gsap.to(rockRef.current, {
          y: 6,
          duration: 2.6,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }

      [wave1Ref.current, wave2Ref.current].forEach((w, i) => {
        if (!w) return;
        gsap.fromTo(
          w,
          { attr: { transform: 'translate(-12,0)' } },
          {
            attr: { transform: 'translate(12,0)' },
            duration: 2.6 + i * 0.5,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          }
        );
      });

      if (flagRef.current) {
        gsap.to(flagRef.current, {
          attr: { d: 'M250 30 L290 38 Q282 44 290 50 L250 50 Z' },
          duration: 1.6,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }

      // Wake / activation waves — visible only while user scrolls or moves mouse
      if (wakeRef.current) {
        gsap.set(wakeRef.current, { opacity: 0 });
        const wakePaths = wakeRef.current.querySelectorAll<SVGPathElement>('path');
        wakePaths.forEach((p, i) => {
          gsap.to(p, {
            attr: { transform: `translate(${10 + i * 4},0)` },
            duration: 1.4 + i * 0.3,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          });
        });

        let idleTimer: ReturnType<typeof setTimeout> | null = null;
        let visible = false;

        const wake = () => {
          if (!visible) {
            visible = true;
            gsap.to(wakeRef.current, { opacity: 1, duration: 0.35, ease: 'sine.out' });
          }
          if (idleTimer) clearTimeout(idleTimer);
          idleTimer = setTimeout(() => {
            visible = false;
            gsap.to(wakeRef.current, { opacity: 0, duration: 1.0, ease: 'sine.in' });
          }, 700);
        };

        window.addEventListener('scroll', wake, { passive: true });
        window.addEventListener('mousemove', wake, { passive: true });
        window.addEventListener('touchmove', wake, { passive: true });

        detachWake = () => {
          window.removeEventListener('scroll', wake);
          window.removeEventListener('mousemove', wake);
          window.removeEventListener('touchmove', wake);
          if (idleTimer) clearTimeout(idleTimer);
        };
      }
    });

    return () => {
      if (detachWake) detachWake();
      ctx.revert();
    };
  }, [isHome]);

  if (!isHome) return null;

  return (
    <div
      ref={wrapperRef}
      className="fixed top-[18%] left-[-18vw] w-[340px] z-[6] pointer-events-none"
      style={{ opacity: 0 }}
      aria-hidden="true"
      data-testid="background-voyager"
    >
      <div ref={rockRef}>
        <svg
          viewBox="0 0 500 500"
          width="100%"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
        >
          {/* === RIGGING (back lines) === */}
          <line x1="250" y1="40" x2="100" y2="320" stroke="#D4AF37" strokeWidth="0.6" opacity="0.5"/>
          <line x1="250" y1="40" x2="400" y2="320" stroke="#D4AF37" strokeWidth="0.6" opacity="0.5"/>
          <line x1="250" y1="80" x2="140" y2="320" stroke="#D4AF37" strokeWidth="0.5" opacity="0.45"/>
          <line x1="250" y1="80" x2="360" y2="320" stroke="#D4AF37" strokeWidth="0.5" opacity="0.45"/>

          {/* === MAIN MAST === */}
          <line x1="250" y1="30" x2="250" y2="335"
            stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round"/>

          {/* === FLAG / PENNANT at masthead === */}
          <path
            ref={flagRef}
            d="M250 30 L296 36 Q288 44 296 50 L250 50 Z"
            fill="#D4AF37" fillOpacity="0.85"
            stroke="#D4AF37" strokeWidth="1"
            strokeLinejoin="round"
          />

          {/* === CROW'S NEST === */}
          <ellipse cx="250" cy="100" rx="14" ry="6"
            fill="#D4AF37" fillOpacity="0.18"
            stroke="#D4AF37" strokeWidth="1"/>

          {/* === YARDS === */}
          <line x1="160" y1="120" x2="340" y2="120" stroke="#D4AF37" strokeWidth="1.4" strokeLinecap="round"/>
          <line x1="140" y1="180" x2="360" y2="180" stroke="#D4AF37" strokeWidth="1.6" strokeLinecap="round"/>
          <line x1="120" y1="240" x2="380" y2="240" stroke="#D4AF37" strokeWidth="1.8" strokeLinecap="round"/>

          {/* === SQUARE SAILS === */}
          <path d="M170 120 L330 120 L320 175 L180 175 Z"
            fill="#D4AF37" fillOpacity="0.10"
            stroke="#D4AF37" strokeWidth="1.2" strokeLinejoin="round"/>
          <path d="M148 180 L352 180 L340 235 L160 235 Z"
            fill="#D4AF37" fillOpacity="0.12"
            stroke="#D4AF37" strokeWidth="1.4" strokeLinejoin="round"/>
          <path d="M128 240 L372 240 Q374 290 372 330 Q250 360 128 330 Q126 290 128 240 Z"
            fill="#D4AF37" fillOpacity="0.14"
            stroke="#D4AF37" strokeWidth="1.6" strokeLinejoin="round"/>

          {/* === BOWSPRIT + JIB === */}
          <line x1="380" y1="370" x2="465" y2="345" stroke="#D4AF37" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M380 340 L465 345 L385 380 Z"
            fill="#D4AF37" fillOpacity="0.10"
            stroke="#D4AF37" strokeWidth="1.2" strokeLinejoin="round"/>

          {/* === HULL === */}
          <path
            d="M75 350
               Q75 365 95 372
               L405 372
               Q425 365 425 350
               Q425 395 380 410
               Q250 432 120 410
               Q75 395 75 350 Z"
            fill="#D4AF37" fillOpacity="0.22"
            stroke="#D4AF37" strokeWidth="1.6" strokeLinejoin="round"
          />
          <line x1="100" y1="386" x2="400" y2="386" stroke="#D4AF37" strokeWidth="0.6" opacity="0.55"/>
          {[120, 160, 200, 240, 280, 320, 360].map((cx) => (
            <circle key={cx} cx={cx} cy="386" r="2.2" fill="#D4AF37" fillOpacity="0.6"/>
          ))}
          <path d="M75 350 Q60 335 70 320 L80 330 Z"
            fill="#D4AF37" fillOpacity="0.35"
            stroke="#D4AF37" strokeWidth="0.8"/>

          {/* === BLUE WAVES — only under the hull, never overlap the ship === */}
          <g>
            <path
              ref={wave1Ref}
              d="M85 438 Q140 432 195 438 T305 438 T415 438"
              fill="none"
              stroke="#5BB8E8"
              strokeWidth="2.2"
              strokeLinecap="round"
              opacity="0.85"
            />
            <path
              ref={wave2Ref}
              d="M105 456 Q160 450 215 456 T325 456 T395 456"
              fill="none"
              stroke="#5BB8E8"
              strokeWidth="1.6"
              strokeLinecap="round"
              opacity="0.6"
            />
          </g>

          {/* === ACTIVATION WAKE — appears only on scroll / mouse move === */}
          <g ref={wakeRef} style={{ opacity: 0 }}>
            {/* Bow wake */}
            <path
              d="M420 412 Q435 404 450 412 T480 412"
              fill="none" stroke="#5BB8E8" strokeWidth="1.8" strokeLinecap="round" opacity="0.85"
            />
            <path
              d="M425 422 Q440 416 455 422 T485 422"
              fill="none" stroke="#5BB8E8" strokeWidth="1.4" strokeLinecap="round" opacity="0.65"
            />
            {/* Stern wake */}
            <path
              d="M20 412 Q35 404 50 412 T80 412"
              fill="none" stroke="#5BB8E8" strokeWidth="1.8" strokeLinecap="round" opacity="0.85"
            />
            <path
              d="M15 422 Q30 416 45 422 T75 422"
              fill="none" stroke="#5BB8E8" strokeWidth="1.4" strokeLinecap="round" opacity="0.65"
            />
            {/* Side ripples */}
            <path
              d="M180 478 Q220 472 260 478 T340 478"
              fill="none" stroke="#5BB8E8" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}
