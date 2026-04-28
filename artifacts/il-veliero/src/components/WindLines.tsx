import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function WindLines() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const lines = containerRef.current.querySelectorAll<HTMLElement>('.wind-line');

    const seedXs = ['0vw', '25vw', '50vw', '75vw'];

    lines.forEach((line, i) => {
      const isSeed = i < 4;
      const startX = isSeed ? seedXs[i] : '-20vw';
      const startDelay = isSeed ? 0 : gsap.utils.random(0, 8);

      gsap.set(line, {
        x: startX,
        opacity: 1,
      });

      gsap.to(line, {
        x: '120vw',
        duration: gsap.utils.random(8, 18),
        repeat: -1,
        ease: 'none',
        delay: startDelay,
        onRepeat: () => {
          gsap.set(line, {
            y: gsap.utils.random(5, 95) + 'vh',
            x: '-20vw',
            opacity: 1,
          });
        },
      });
    });
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[998] overflow-hidden">
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="wind-line absolute h-[2px] w-64 bg-[#D4AF37] shadow-[0_0_15px_#D4AF37]"
          style={{ top: `${5 + Math.random() * 90}vh`, left: 0 }}
        />
      ))}
    </div>
  );
}
