import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function WindLines() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lines = gsap.utils.toArray<HTMLElement>('.wind-line');

    lines.forEach((line) => {
      gsap.to(line, {
        x: '110vw',
        duration: 15,
        repeat: -1,
        ease: 'none',
        delay: gsap.utils.random(0, 12),
        onRepeat: () => {
          gsap.set(line, {
            y: gsap.utils.random(0, 100) + 'vh',
            x: '-20vw',
            width: gsap.utils.random(60, 160),
          });
        },
      });
    });
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[5] overflow-hidden opacity-[0.1]">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="wind-line absolute h-px w-20 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
          style={{ top: `${Math.random() * 100}vh`, left: '-10vw' }}
        />
      ))}
    </div>
  );
}
