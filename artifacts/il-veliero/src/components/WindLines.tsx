import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function WindLines() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const lines = containerRef.current.querySelectorAll<HTMLElement>('.wind-line');

    lines.forEach((line) => {
      gsap.set(line, { x: '-20vw', opacity: gsap.utils.random(0.05, 0.15) });
      gsap.to(line, {
        x: '120vw',
        duration: gsap.utils.random(15, 25),
        repeat: -1,
        ease: 'none',
        delay: gsap.utils.random(0, 10),
        onRepeat: () => {
          gsap.set(line, {
            y: gsap.utils.random(10, 90) + 'vh',
            x: '-20vw',
            opacity: gsap.utils.random(0.05, 0.15),
          });
        },
      });
    });
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[5] overflow-hidden">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="wind-line absolute h-[1px] w-40 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
          style={{ top: `${Math.random() * 100}vh`, left: '-20vw' }}
        />
      ))}
    </div>
  );
}
