import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNav } from './NavigationContext';

gsap.registerPlugin(ScrollTrigger);

// Pure swirl / vortex glyphs — NO straight tails, only spirals and curls.
// "Tumbleweed" feel — each glyph is a self-contained whirl.
// Drawn in soft gray and blended with `multiply` so they fade to invisible
// over dark text and dark photographs (effectively "text protection"
// without needing per-element masks).
const SWIRL_GLYPH_PATHS = [
  // Variant A — tight inward spiral
  ['M50 30 Q70 30 70 18 Q70 6 50 6 Q26 6 26 32 Q26 60 60 60 Q92 60 92 28 Q92 8 70 8'],
  // Variant B — looping curl that crosses itself
  ['M14 32 Q14 12 38 12 Q62 12 62 30 Q62 50 38 50 Q22 50 22 36 Q22 24 38 24 Q50 24 50 34'],
  // Variant C — double whirl
  ['M16 30 Q16 14 32 14 Q48 14 48 30 Q48 42 34 42 Q24 42 24 32', 'M58 30 Q58 14 74 14 Q90 14 90 30 Q90 42 76 42 Q66 42 66 32'],
  // Variant D — open whirlpool with tighter inner loop
  ['M84 32 Q84 12 54 12 Q24 12 24 36 Q24 56 50 56 Q72 56 72 38 Q72 26 56 26 Q46 26 46 36'],
  // Variant E — small double curl
  ['M24 24 Q24 14 36 14 Q48 14 48 24 Q48 32 38 32 Q30 32 30 26', 'M58 38 Q58 28 70 28 Q82 28 82 38 Q82 46 72 46 Q64 46 64 40'],
];

// Fewer, smaller, more random — 14 swirls scattered across the viewport.
const WIND_WISPS = Array.from({ length: 14 }, (_, i) => {
  const variantIdx = i % SWIRL_GLYPH_PATHS.length;
  return {
    top: `${5 + ((i * 41) % 88)}vh`,
    left: `${-(8 + ((i * 17) % 24))}vw`,
    size: 60 + ((i * 23) % 55),           // 60–115 px (was 110–240)
    delay: (i * 1.1) % 13,
    dur: 22 + ((i * 13) % 18),            // 22–40 s (slower → more random feel)
    scale: 0.85 + ((i * 29) % 40) / 100,  // 0.85–1.25
    rotation: -25 + ((i * 23) % 50),      // wider rotation range for randomness
    spinDir: i % 2 === 0 ? 1 : -1,
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
        const dur = parseFloat(wisp.dataset.dur || '25');
        const scale = parseFloat(wisp.dataset.scale || '1');
        const rotation = parseFloat(wisp.dataset.rotation || '0');
        const spinDir = parseFloat(wisp.dataset.spin || '1');
        gsap.set(wisp, { x: 0, opacity: 0, scale, rotation });

        // Slow horizontal drift across the viewport
        continuousTweens.push(
          gsap.to(wisp, {
            x: '130vw',
            duration: dur,
            repeat: -1,
            ease: 'sine.inOut',
            delay,
            keyframes: {
              opacity: [0, 0.45, 0.55, 0.45, 0],
              easeEach: 'none',
            },
          })
        );

        // Tumbleweed-like vertical bob
        continuousTweens.push(
          gsap.to(wisp, {
            y: '+=24',
            duration: 2.6 + Math.random() * 2,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: delay * 0.4,
          })
        );

        // Continuous slow rotation of the swirl itself — adds tumbling feel
        continuousTweens.push(
          gsap.to(wisp, {
            rotation: `+=${spinDir * 360}`,
            duration: 18 + Math.random() * 8,
            repeat: -1,
            ease: 'none',
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
      className="fixed inset-0 pointer-events-none z-[1] overflow-hidden"
      aria-hidden="true"
    >
      {/* Wind layer — gray swirls / vortices, multiply-blended so they
          disappear over dark text and dark photographs. */}
      <div
        ref={windLayerRef}
        className="absolute inset-0"
        style={{ mixBlendMode: 'multiply' }}
      >
        {WIND_WISPS.map((w, i) => {
          const paths = SWIRL_GLYPH_PATHS[w.variantIdx];
          return (
            <div
              key={`wind-${i}`}
              className="wind-wisp absolute"
              data-delay={w.delay}
              data-dur={w.dur}
              data-scale={w.scale}
              data-rotation={w.rotation}
              data-spin={w.spinDir}
              style={{
                top: w.top,
                left: w.left,
                width: `${w.size}px`,
                height: `${w.size}px`,
              }}
            >
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 100 64"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {paths.map((d, j) => (
                  <path
                    key={j}
                    d={d}
                    fill="none"
                    stroke="#9CA3AF"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.9"
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
