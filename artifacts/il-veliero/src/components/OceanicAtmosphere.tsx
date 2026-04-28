import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const WAVES = [
  { top: '18vh', d: 'M0,10 Q60,0 120,10 T240,10 T360,10 T480,10 T600,10' },
  { top: '34vh', d: 'M0,10 Q70,18 140,10 T280,10 T420,10 T560,10 T700,10' },
  { top: '52vh', d: 'M0,10 Q50,2 100,10 T200,10 T300,10 T400,10 T500,10 T600,10' },
  { top: '68vh', d: 'M0,10 Q80,16 160,10 T320,10 T480,10 T640,10' },
  { top: '82vh', d: 'M0,10 Q55,4 110,10 T220,10 T330,10 T440,10 T550,10 T660,10' },
];

const WIND_STREAKS = [
  { top: '8vh',  width: '34vw', delay: 0,    dur: 14 },
  { top: '15vh', width: '22vw', delay: 2.5,  dur: 17 },
  { top: '24vh', width: '40vw', delay: 5.0,  dur: 12 },
  { top: '38vh', width: '28vw', delay: 1.5,  dur: 19 },
  { top: '46vh', width: '36vw', delay: 7.0,  dur: 15 },
  { top: '60vh', width: '24vw', delay: 3.5,  dur: 18 },
];

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
  const wavesLayerRef = useRef<HTMLDivElement>(null);
  const windLayerRef = useRef<HTMLDivElement>(null);
  const sandLayerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // ----- Continuous animations (waves / wind / sand) -----
      const waves = wavesLayerRef.current?.querySelectorAll<HTMLElement>('.ocean-wave') ?? [];
      waves.forEach((wave, i) => {
        gsap.set(wave, { x: '-10vw' });
        gsap.to(wave, {
          x: '100vw',
          duration: gsap.utils.random(28, 38),
          repeat: -1,
          ease: 'none',
          delay: i * 1.4,
        });
        gsap.to(wave, {
          y: '+=18',
          duration: 4 + (i % 2),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.3,
        });
      });

      const streaks = windLayerRef.current?.querySelectorAll<HTMLElement>('.wind-streak') ?? [];
      streaks.forEach((streak) => {
        const delay = parseFloat(streak.dataset.delay || '0');
        const dur = parseFloat(streak.dataset.dur || '15');
        gsap.set(streak, { x: '-50vw', opacity: 0 });
        gsap.to(streak, {
          x: '120vw',
          opacity: 0.45,
          duration: dur,
          repeat: -1,
          ease: 'power1.inOut',
          delay,
          keyframes: {
            opacity: [0, 0.45, 0.45, 0],
            easeEach: 'none',
          },
        });
      });

      const grains = sandLayerRef.current?.querySelectorAll<HTMLElement>('.sand-grain') ?? [];
      grains.forEach((grain) => {
        const delay = parseFloat(grain.dataset.delay || '0');
        const dur = parseFloat(grain.dataset.dur || '10');
        const driftY = parseFloat(grain.dataset.driftY || '-8');
        gsap.set(grain, { x: 0, y: 0, opacity: 0 });
        gsap.to(grain, {
          x: '+=40',
          y: `+=${driftY}`,
          opacity: 0.55,
          duration: dur,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay,
        });
      });

      // ----- Scroll-driven reveal -----
      // The atmosphere stays hidden over the hero (so it never competes with
      // the booking widget) and gently fades in once the hero — including the
      // Prenota Ora block at its bottom — has scrolled out of view.
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
        // Inner routes have no hero — show the atmosphere at full strength.
        gsap.set(containerRef.current, { opacity: 1 });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-[5] overflow-hidden"
    >
      {/* Wind layer — pale sky-blue streaks drifting across upper half */}
      <div ref={windLayerRef} className="absolute inset-0">
        {WIND_STREAKS.map((s, i) => (
          <div
            key={`wind-${i}`}
            className="wind-streak absolute"
            data-delay={s.delay}
            data-dur={s.dur}
            style={{
              top: s.top,
              left: 0,
              width: s.width,
              height: '1px',
              background:
                'linear-gradient(90deg, rgba(91,184,232,0) 0%, rgba(91,184,232,0.85) 50%, rgba(91,184,232,0) 100%)',
              filter: 'blur(0.5px)',
            }}
          />
        ))}
      </div>

      {/* Wave layer — gold horizon strokes */}
      <div ref={wavesLayerRef} className="absolute inset-0">
        {WAVES.map((wave, i) => (
          <div
            key={`wave-${i}`}
            className="ocean-wave absolute"
            style={{ top: wave.top, left: 0, width: '80vw', height: '20px' }}
          >
            <svg
              width="100%"
              height="20"
              viewBox="0 0 700 20"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d={wave.d}
                fill="none"
                stroke="#D4AF37"
                strokeWidth="0.5"
                opacity="0.12"
              />
            </svg>
          </div>
        ))}
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
