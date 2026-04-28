import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function WindLines() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const lines = containerRef.current.querySelectorAll<HTMLElement>('.wind-line');

    lines.forEach((line) => {
      gsap.set(line, { x: '-20vw', opacity: 0 });

      gsap.to(line, {
        x: '120vw',
        duration: gsap.utils.random(15, 30),
        repeat: -1,
        ease: 'none',
        delay: gsap.utils.random(0, 15),
        onRepeat: () => {
          gsap.set(line, {
            y: gsap.utils.random(10, 90) + 'vh',
            x: '-20vw',
            opacity: gsap.utils.random(0.03, 0.1),
          });
        },
      });
    });
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[5] overflow-hidden">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="wind-line absolute h-[1px] w-64 bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent"
          style={{ top: `${Math.random() * 100}vh`, left: '-20vw' }}
        />
      ))}
    </div>
  );
}
