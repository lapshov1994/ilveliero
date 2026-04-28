import React, { useRef, useEffect } from 'react';
import { Link } from 'wouter';
import gsap from 'gsap';
import { useNav } from './NavigationContext';

export default function InnerPageHeader() {
  const { toggle, isOpen } = useNav();
  const sailboatRef = useRef<HTMLDivElement>(null);
  const swayRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    if (sailboatRef.current) {
      swayRef.current = gsap.to(sailboatRef.current, {
        rotation: 6,
        duration: 4.5,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        transformOrigin: 'center bottom',
      });
    }
    return () => {
      swayRef.current?.kill();
      swayRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!swayRef.current) return;
    if (isOpen) swayRef.current.pause();
    else swayRef.current.resume();
  }, [isOpen]);

  return (
    <header className="fixed top-0 left-0 w-full px-8 py-6 z-50 flex justify-between items-center bg-white/95 backdrop-blur-sm border-b border-[#0A1128]/5">
      <Link href="/" className="flex items-center gap-3 group cursor-pointer">
        <div className="relative z-50">
          <div ref={sailboatRef} className="relative z-50">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#0A1128] drop-shadow-sm">
              <path d="M12 2L20 14H4L12 2Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1"/>
              <path d="M12 22V14" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M5 14C5 14 8 16 12 16C16 16 19 14 19 14" stroke="#D4AF37" strokeWidth="1" strokeDasharray="2 2" className="opacity-60"/>
            </svg>
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-[#D4AF37] opacity-0 group-hover:w-full group-hover:opacity-40 transition-all duration-700" />
        </div>
        <div className="text-[#0A1128] text-base tracking-[0.25em] font-serif uppercase">
          il veliero <span className="text-[#D4AF37] ml-1 text-xs opacity-80">★★★</span>
        </div>
      </Link>

      <button
        onClick={toggle}
        className="text-xs tracking-widest uppercase text-[#0A1128] hover:text-[#D4AF37] transition-colors relative overflow-hidden group"
      >
        Menu
        <span className="absolute bottom-0 left-0 w-full h-px bg-[#D4AF37] translate-x-[-105%] group-hover:translate-x-0 transition-transform duration-300 origin-left" />
      </button>
    </header>
  );
}
