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

// Curly wind wisps — each is an SVG with a swirling S-curve path
const WIND_WISPS = [
  { top: '9vh',  size: 220, delay: 0,    dur: 16, scale: 1.0,
    d: 'M5,40 Q40,10 80,30 T160,30 Q190,40 215,20' },
  { top: '17vh', size: 170, delay: 3.0,  dur: 19, scale: 0.9,
    d: 'M5,30 Q30,55 60,30 T120,30 Q145,15 165,35' },
  { top: '26vh', size: 260, delay: 5.5,  dur: 14, scale: 1.1,
    d: 'M5,40 Q50,15 100,40 T200,40 Q230,55 255,30' },
  { top: '36vh', size: 200, delay: 1.5,  dur: 21, scale: 0.95,
    d: 'M5,35 Q35,10 70,35 T140,35 Q175,55 195,25' },
  { top: '46vh', size: 240, delay: 7.5,  dur: 17, scale: 1.05,
    d: 'M5,40 Q45,55 90,30 T180,30 Q210,15 235,40' },
  { top: '58vh', size: 190, delay: 3.5,  dur: 20, scale: 0.95,
    d: 'M5,35 Q40,10 75,35 T150,35 Q175,15 185,40' },
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

      const wisps = windLayerRef.current?.querySelectorAll<HTMLElement>('.wind-wisp') ?? [];
      wisps.forEach((wisp) => {
        const delay = parseFloat(wisp.dataset.delay || '0');
        const dur = parseFloat(wisp.dataset.dur || '15');
        const scale = parseFloat(wisp.dataset.scale || '1');
        gsap.set(wisp, { x: '-30vw', opacity: 0, scale });
        gsap.to(wisp, {
          x: '120vw',
          duration: dur,
          repeat: -1,
          ease: 'sine.inOut',
          delay,
          keyframes: {
            opacity: [0, 0.55, 0.65, 0.55, 0],
            easeEach: 'none',
          },
        });
        // Gentle vertical undulation while drifting (the curl)
        gsap.to(wisp, {
          y: '+=14',
          duration: 3 + (Math.random() * 1.5),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: delay * 0.4,
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
      aria-hidden="true"
    >
      {/* Wind layer — curly sky-blue wisps drifting across the upper half */}
      <div ref={windLayerRef} className="absolute inset-0">
        {WIND_WISPS.map((w, i) => (
          <div
            key={`wind-${i}`}
            className="wind-wisp absolute"
            data-delay={w.delay}
            data-dur={w.dur}
            data-scale={w.scale}
            style={{
              top: w.top,
              left: 0,
              width: `${w.size}px`,
              height: '60px',
              filter: 'blur(0.6px)',
            }}
          >
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 260 60"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d={w.d}
                fill="none"
                stroke="#5BB8E8"
                strokeWidth="1.4"
                strokeLinecap="round"
                opacity="0.9"
              />
              <path
                d={w.d}
                fill="none"
                stroke="#5BB8E8"
                strokeWidth="0.8"
                strokeLinecap="round"
                opacity="0.5"
                transform="translate(0,6)"
              />
            </svg>
          </div>
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
                strokeWidth="1.1"
                opacity="0.32"
              />
              <path
                d={wave.d}
                fill="none"
                stroke="#5BB8E8"
                strokeWidth="0.7"
                opacity="0.22"
                transform="translate(0,3)"
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
