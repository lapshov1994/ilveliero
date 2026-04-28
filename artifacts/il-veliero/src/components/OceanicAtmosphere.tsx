import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const WAVES = [
  { top: '12vh', d: 'M0,10 Q60,0 120,10 T240,10 T360,10 T480,10 T600,10' },
  { top: '26vh', d: 'M0,10 Q70,18 140,10 T280,10 T420,10 T560,10 T700,10' },
  { top: '42vh', d: 'M0,10 Q50,2 100,10 T200,10 T300,10 T400,10 T500,10 T600,10' },
  { top: '58vh', d: 'M0,10 Q80,16 160,10 T320,10 T480,10 T640,10' },
  { top: '74vh', d: 'M0,10 Q55,4 110,10 T220,10 T330,10 T440,10 T550,10 T660,10' },
  { top: '88vh', d: 'M0,10 Q65,14 130,10 T260,10 T390,10 T520,10 T650,10' },
];

export default function OceanicAtmosphere() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const waves = containerRef.current.querySelectorAll<HTMLElement>('.ocean-wave');

    waves.forEach((wave, i) => {
      gsap.set(wave, { x: '-10vw' });

      // Slow horizontal drift across the whole viewport
      gsap.to(wave, {
        x: '100vw',
        duration: gsap.utils.random(25, 35),
        repeat: -1,
        ease: 'none',
        delay: i * 1.4,
      });

      // Subtle vertical bobbing
      gsap.to(wave, {
        y: '+=18',
        duration: 4 + (i % 2),
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 0.3,
      });
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-[5] overflow-hidden"
    >
      {WAVES.map((wave, i) => (
        <div
          key={i}
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
              opacity="0.1"
            />
          </svg>
        </div>
      ))}
    </div>
  );
}
