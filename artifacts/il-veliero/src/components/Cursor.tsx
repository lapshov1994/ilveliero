import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function Cursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      gsap.to(cursorRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1,
        ease: "power2.out",
      });
      gsap.to(followerRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.4,
        ease: "power2.out",
      });
    };

    const onMouseEnter = () => setIsHovering(true);
    const onMouseLeave = () => setIsHovering(false);

    window.addEventListener('mousemove', onMouseMove);

    const links = document.querySelectorAll('a, button, [role="button"]');
    links.forEach(link => {
      link.addEventListener('mouseenter', onMouseEnter);
      link.addEventListener('mouseleave', onMouseLeave);
    });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      links.forEach(link => {
        link.removeEventListener('mouseenter', onMouseEnter);
        link.removeEventListener('mouseleave', onMouseLeave);
      });
    };
  }, []);

  useEffect(() => {
    if (isHovering) {
      gsap.to(followerRef.current, { scale: 2, borderColor: '#D4AF37', duration: 0.3 });
      gsap.to(cursorRef.current, { opacity: 0, duration: 0.2 });
    } else {
      gsap.to(followerRef.current, { scale: 1, borderColor: '#D4AF37', duration: 0.3 });
      gsap.to(cursorRef.current, { opacity: 1, duration: 0.2 });
    }
  }, [isHovering]);

  return (
    <div className="hidden md:block pointer-events-none fixed inset-0 z-[9999]">
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-1 h-1 bg-[#D4AF37] -translate-x-1/2 -translate-y-1/2"
      />
      <div
        ref={followerRef}
        className="fixed top-0 left-0 w-8 h-8 border border-[#D4AF37] rounded-full -translate-x-1/2 -translate-y-1/2"
      />
    </div>
  );
}
