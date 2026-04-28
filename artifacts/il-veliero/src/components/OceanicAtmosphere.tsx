import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const WAVES = [
  { top: '8vh',  d: 'M0,10 Q60,0 120,10 T240,10 T360,10 T480,10 T600,10' },
  { top: '22vh', d: 'M0,10 Q70,20 140,10 T280,10 T420,10 T560,10 T700,10' },
  { top: '36vh', d: 'M0,10 Q50,2 100,10 T200,10 T300,10 T400,10 T500,10 T600,10' },
  { top: '50vh', d: 'M0,10 Q80,18 160,10 T320,10 T480,10 T640,10' },
  { top: '64vh', d: 'M0,10 Q55,4 110,10 T220,10 T330,10 T440,10 T550,10 T660,10' },
  { top: '78vh', d: 'M0,10 Q65,16 130,10 T260,10 T390,10 T520,10 T650,10' },
  { top: '92vh', d: 'M0,10 Q45,2 90,10 T180,10 T270,10 T360,10 T450,10 T540,10' },
];

export default function OceanicAtmosphere() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const waves = containerRef.current.querySelectorAll<HTMLElement>('.ocean-wave');

    waves.forEach((wave, i) => {
      gsap.set(wave, { x: '-10vw' });

      // Constant horizontal drift across the screen
      gsap.to(wave, {
        x: '110vw',
        duration: 20 + (i % 3) * 4,
        repeat: -1,
        ease: 'none',
        delay: i * 1.2,
      });

      // Subtle vertical bobbing
      gsap.to(wave, {
        y: '+=15',
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
              strokeOpacity="0.08"
            />
          </svg>
        </div>
      ))}
    </div>
  );
}
