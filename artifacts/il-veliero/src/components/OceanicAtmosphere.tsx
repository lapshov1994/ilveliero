import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNav } from './NavigationContext';

gsap.registerPlugin(ScrollTrigger);

// Hand-drawn cartoon wind glyph — multiple curls + tails.
// Stroke is sky-blue so it reads on both light and dark backgrounds.
const WIND_GLYPH_PATHS = [
  // Variant A — two curls + lower tail
  [
    'M5 30 Q25 30 42 28 Q58 22 62 32 Q64 42 52 42 Q44 40 50 32',
    'M55 46 Q70 46 85 46 Q95 42 96 50 Q95 56 88 54',
    'M5 18 Q22 18 38 18',
  ],
  // Variant B — single big curl + two tails
  [
    'M5 25 Q22 25 36 22 Q52 14 58 26 Q60 38 46 38 Q36 36 44 26',
    'M50 44 Q70 44 92 44',
    'M3 38 Q20 38 32 38',
  ],
  // Variant C — small curl on the right with a long tail
  [
    'M5 28 Q30 28 55 28 Q70 28 78 24 Q88 18 92 28 Q92 36 82 34',
    'M10 40 Q30 40 50 40',
    'M5 16 Q22 16 36 16',
  ],
  // Variant D — twin spirals
  [
    'M3 22 Q18 22 30 18 Q42 12 46 22 Q46 30 38 30 Q32 28 38 22',
    'M50 36 Q66 36 78 32 Q90 26 94 36 Q94 44 86 44 Q80 42 86 36',
    'M5 48 Q22 48 36 48',
  ],
];

// 22 wind glyphs scattered randomly across the whole viewport
const WIND_WISPS = Array.from({ length: 22 }, (_, i) => {
  const variantIdx = i % WIND_GLYPH_PATHS.length;
  // Use prime-ish multipliers for pseudo-random scatter
  return {
    top: `${4 + ((i * 37) % 90)}vh`,
    left: `${-(8 + ((i * 13) % 22))}vw`, // start off-screen left
    size: 110 + ((i * 19) % 130),         // 110–240px (was 80–170)
    delay: (i * 0.8) % 11,
    dur: 14 + ((i * 11) % 16),            // 14–30s
    scale: 0.9 + ((i * 23) % 40) / 100,   // 0.9–1.3
    rotation: -12 + ((i * 17) % 24),
    variantIdx,
  };
});

// 28 sand grains drifting along the bottom
const SAND_GRAINS = Array.from({ length: 28 }, (_, i) => ({
  left: `${(i * 3.7) % 100}%`,
  bottom: `${2 + ((i * 7) % 22)}vh`,
  size: 1 + (i % 3) * 0.6,
  delay: (i * 0.35) % 8,
  dur: 9 + (i % 5) * 2.4,
  driftY: -8 - (i % 4) * 4,
}));

export default function OceanicAtmosphere() {
  const containerRef = useRef<HTMLDivElement>(null);
  const windLayerRef = useRef<HTMLDivElement>(null);
  const sandLayerRef = useRef<HTMLDivElement>(null);
  const continuousTweensRef = useRef<gsap.core.Tween[]>([]);
  const { isOpen } = useNav();

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const continuousTweens: gsap.core.Tween[] = [];

      const wisps = windLayerRef.current?.querySelectorAll<HTMLElement>('.wind-wisp') ?? [];
      wisps.forEach((wisp) => {
        const delay = parseFloat(wisp.dataset.delay || '0');
        const dur = parseFloat(wisp.dataset.dur || '15');
        const scale = parseFloat(wisp.dataset.scale || '1');
        const rotation = parseFloat(wisp.dataset.rotation || '0');
        gsap.set(wisp, { x: 0, opacity: 0, scale, rotation });
        continuousTweens.push(
          gsap.to(wisp, {
            x: '130vw',
            duration: dur,
            repeat: -1,
            ease: 'sine.inOut',
            delay,
            keyframes: {
              opacity: [0, 0.85, 1, 0.95, 0],
              easeEach: 'none',
            },
          })
        );
        continuousTweens.push(
          gsap.to(wisp, {
            y: '+=18',
            duration: 3 + (Math.random() * 1.8),
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: delay * 0.4,
          })
        );
      });

      const grains = sandLayerRef.current?.querySelectorAll<HTMLElement>('.sand-grain') ?? [];
      grains.forEach((grain) => {
        const delay = parseFloat(grain.dataset.delay || '0');
        const dur = parseFloat(grain.dataset.dur || '10');
        const driftY = parseFloat(grain.dataset.driftY || '-8');
        gsap.set(grain, { x: 0, y: 0, opacity: 0 });
        continuousTweens.push(
          gsap.to(grain, {
            x: '+=40',
            y: `+=${driftY}`,
            opacity: 0.55,
            duration: dur,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay,
          })
        );
      });

      continuousTweensRef.current = continuousTweens;

      // Reveal only after the booking widget scrolls past
      const hero = document.querySelector('.hero-section');
      if (hero) {
        gsap.set(containerRef.current, { opacity: 0 });
        gsap.to(containerRef.current, {
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: hero,
            start: 'bottom 80%',
            end: 'bottom 20%',
            scrub: true,
          },
        });
      } else {
        gsap.set(containerRef.current, { opacity: 1 });
      }
    });

    return () => {
      continuousTweensRef.current = [];
      ctx.revert();
    };
  }, []);

  useEffect(() => {
    continuousTweensRef.current.forEach((t) => {
      if (isOpen) t.pause();
      else t.resume();
    });
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-[5] overflow-hidden"
      aria-hidden="true"
    >
      {/* Wind layer — hand-drawn cartoon curls scattered across the whole viewport */}
      <div ref={windLayerRef} className="absolute inset-0">
        {WIND_WISPS.map((w, i) => {
          const paths = WIND_GLYPH_PATHS[w.variantIdx];
          return (
            <div
              key={`wind-${i}`}
              className="wind-wisp absolute"
              data-delay={w.delay}
              data-dur={w.dur}
              data-scale={w.scale}
              data-rotation={w.rotation}
              style={{
                top: w.top,
                left: w.left,
                width: `${w.size}px`,
                height: `${Math.round(w.size * 0.55)}px`,
              }}
            >
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 100 60"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {paths.map((d, j) => (
                  <path
                    key={j}
                    d={d}
                    fill="none"
                    stroke="#5BB8E8"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.95"
                  />
                ))}
              </svg>
            </div>
          );
        })}
      </div>

      {/* Sand layer — tiny gold grains drifting along the bottom */}
      <div ref={sandLayerRef} className="absolute inset-x-0 bottom-0 h-[30vh]">
        {SAND_GRAINS.map((g, i) => (
          <div
            key={`sand-${i}`}
            className="sand-grain absolute rounded-full"
            data-delay={g.delay}
            data-dur={g.dur}
            data-drift-y={g.driftY}
            style={{
              left: g.left,
              bottom: g.bottom,
              width: `${g.size}px`,
              height: `${g.size}px`,
              background: '#D4AF37',
              boxShadow: '0 0 2px rgba(212,175,55,0.6)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
