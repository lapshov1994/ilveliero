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
  const wave3Ref = useRef<SVGPathElement>(null);
  const sprayRef = useRef<SVGGElement>(null);
  const flagRef = useRef<SVGPathElement>(null);
  const [location] = useLocation();
  const isHome = location === '/' || location === '';

  useEffect(() => {
    if (!isHome || !wrapperRef.current) return;

    const track = document.getElementById('voyager-track');
    if (!track) return;

    const ctx = gsap.context(() => {
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

      [wave1Ref.current, wave2Ref.current, wave3Ref.current].forEach((w, i) => {
        if (!w) return;
        gsap.fromTo(
          w,
          { attr: { transform: 'translate(-30,0)' } },
          {
            attr: { transform: 'translate(30,0)' },
            duration: 3 + i * 0.6,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          }
        );
      });

      if (sprayRef.current) {
        gsap.to(sprayRef.current.querySelectorAll('circle'), {
          opacity: 0,
          y: -10,
          duration: 1.8,
          repeat: -1,
          yoyo: true,
          stagger: 0.18,
          ease: 'sine.inOut',
        });
      }

      if (flagRef.current) {
        gsap.to(flagRef.current, {
          attr: { d: 'M250 30 L290 38 Q282 44 290 50 L250 50 Z' },
          duration: 1.6,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }
    });

    return () => ctx.revert();
  }, [isHome]);

  if (!isHome) return null;

  return (
    <div
      ref={wrapperRef}
      className="fixed top-[18%] left-[-25vw] w-[520px] z-[2] pointer-events-none"
      style={{ opacity: 0.18 }}
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
          <line
            x1="250" y1="30" x2="250" y2="335"
            stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round"
          />

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

          {/* === YARDS (horizontal spars) === */}
          <line x1="160" y1="120" x2="340" y2="120" stroke="#D4AF37" strokeWidth="1.4" strokeLinecap="round"/>
          <line x1="140" y1="180" x2="360" y2="180" stroke="#D4AF37" strokeWidth="1.6" strokeLinecap="round"/>
          <line x1="120" y1="240" x2="380" y2="240" stroke="#D4AF37" strokeWidth="1.8" strokeLinecap="round"/>

          {/* === SQUARE SAILS (top to bottom) === */}
          {/* Topgallant — smallest */}
          <path
            d="M170 120 L330 120 L320 175 L180 175 Z"
            fill="#D4AF37" fillOpacity="0.10"
            stroke="#D4AF37" strokeWidth="1.2" strokeLinejoin="round"
          />
          {/* Topsail — middle */}
          <path
            d="M148 180 L352 180 L340 235 L160 235 Z"
            fill="#D4AF37" fillOpacity="0.12"
            stroke="#D4AF37" strokeWidth="1.4" strokeLinejoin="round"
          />
          {/* Mainsail — largest, gently belly-curved */}
          <path
            d="M128 240 L372 240 Q374 290 372 330 Q250 360 128 330 Q126 290 128 240 Z"
            fill="#D4AF37" fillOpacity="0.14"
            stroke="#D4AF37" strokeWidth="1.6" strokeLinejoin="round"
          />

          {/* === BOWSPRIT (forward jutting spar) === */}
          <line x1="380" y1="370" x2="465" y2="345" stroke="#D4AF37" strokeWidth="1.8" strokeLinecap="round"/>
          {/* Jib sail on bowsprit */}
          <path
            d="M380 340 L465 345 L385 380 Z"
            fill="#D4AF37" fillOpacity="0.10"
            stroke="#D4AF37" strokeWidth="1.2" strokeLinejoin="round"
          />

          {/* === HULL — long galleon-style with curved keel === */}
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

          {/* === HULL DETAIL — gun-port line === */}
          <line x1="100" y1="386" x2="400" y2="386" stroke="#D4AF37" strokeWidth="0.6" opacity="0.55"/>
          {/* portholes */}
          {[120, 160, 200, 240, 280, 320, 360].map((cx) => (
            <circle key={cx} cx={cx} cy="386" r="2.2" fill="#D4AF37" fillOpacity="0.6"/>
          ))}

          {/* === STERN ornament === */}
          <path
            d="M75 350 Q60 335 70 320 L80 330 Z"
            fill="#D4AF37" fillOpacity="0.35"
            stroke="#D4AF37" strokeWidth="0.8"
          />

          {/* === WAVES UNDER THE SHIP === */}
          <g opacity="0.85">
            <path
              ref={wave1Ref}
              d="M0 432 Q80 422 160 432 T320 432 T480 432 L500 432 L500 442 L0 442 Z"
              fill="none"
              stroke="#D4AF37"
              strokeWidth="1.4"
              opacity="0.7"
            />
            <path
              ref={wave2Ref}
              d="M0 448 Q70 438 140 448 T280 448 T420 448 T500 448"
              fill="none"
              stroke="#D4AF37"
              strokeWidth="1.1"
              opacity="0.55"
            />
            <path
              ref={wave3Ref}
              d="M0 464 Q90 456 180 464 T360 464 T500 464"
              fill="none"
              stroke="#D4AF37"
              strokeWidth="0.9"
              opacity="0.4"
            />
          </g>

          {/* === SPRAY / FOAM around bow & stern === */}
          <g ref={sprayRef}>
            <circle cx="430" cy="410" r="2.6" fill="#D4AF37" opacity="0.7"/>
            <circle cx="445" cy="418" r="1.8" fill="#D4AF37" opacity="0.55"/>
            <circle cx="455" cy="408" r="1.4" fill="#D4AF37" opacity="0.45"/>
            <circle cx="60"  cy="410" r="2.2" fill="#D4AF37" opacity="0.6"/>
            <circle cx="42"  cy="420" r="1.6" fill="#D4AF37" opacity="0.5"/>
            <circle cx="30"  cy="408" r="1.2" fill="#D4AF37" opacity="0.4"/>
          </g>
        </svg>
      </div>
    </div>
  );
}
