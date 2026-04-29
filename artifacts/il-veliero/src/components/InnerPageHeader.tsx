import React, { useRef, useEffect } from 'react';
import { Link } from 'wouter';
import gsap from 'gsap';
import { useNav } from './NavigationContext';
import MenuTrigger from './MenuTrigger';
import shipLogoUrl from '@assets/sailing-ship-silhouette-000000-xl_1777459411002.png';

export default function InnerPageHeader() {
  const { isOpen } = useNav();
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
    <header className="fixed top-0 left-0 w-full px-8 py-6 z-[150] flex justify-between items-center bg-white/95 backdrop-blur-sm border-b border-[#0A1128]/5">
      <Link href="/" className="flex items-center gap-3 group cursor-pointer">
        <div className="relative z-50">
          <div ref={sailboatRef} className="relative z-50">
            <div
              className="w-7 h-7 drop-shadow-sm"
              style={{
                backgroundColor: '#0A1128',
                WebkitMaskImage: `url(${shipLogoUrl})`,
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskSize: 'contain',
                WebkitMaskPosition: 'center',
                maskImage: `url(${shipLogoUrl})`,
                maskRepeat: 'no-repeat',
                maskSize: 'contain',
                maskPosition: 'center',
              }}
            />
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-[#D4AF37] opacity-0 group-hover:w-full group-hover:opacity-40 transition-all duration-700" />
        </div>
        <div className="text-[#0A1128] text-base tracking-[0.25em] font-serif uppercase">
          il veliero <span className="text-[#D4AF37] ml-1 text-xs opacity-80">★★★</span>
        </div>
      </Link>

      <MenuTrigger className="text-[#0A1128] hover:text-[#D4AF37] transition-colors" />
    </header>
  );
}
