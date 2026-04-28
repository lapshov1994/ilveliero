import React, { useEffect, useRef } from 'react';
import { Link } from 'wouter';
import gsap from 'gsap';
import { useNav } from './NavigationContext';

const links = [
  { label: 'Home', href: '/' },
  { label: 'Camere', href: '/rooms' },
  { label: 'Galleria', href: '/gallery' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contatti', href: '/#footer' },
];

export default function Navigation() {
  const { isOpen, close } = useNav();
  const overlayRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<(HTMLLIElement | null)[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    tlRef.current = gsap.timeline({ paused: true })
      .fromTo(overlayRef.current,
        { yPercent: -100, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.6, ease: 'power3.inOut' }
      )
      .fromTo(linksRef.current.filter(Boolean),
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out' },
        '-=0.2'
      );
  }, []);

  useEffect(() => {
    if (!tlRef.current) return;
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      tlRef.current.play();
    } else {
      document.body.style.overflow = '';
      tlRef.current.reverse();
    }
  }, [isOpen]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[1000] bg-[#0A1128] flex flex-col justify-center items-center"
      style={{ pointerEvents: isOpen ? 'all' : 'none', opacity: 0, transform: 'translateY(-100%)' }}
    >
      {/* Close button */}
      <button
        onClick={close}
        className="absolute top-8 right-8 text-white/60 hover:text-[#D4AF37] transition-colors text-xs tracking-[0.3em] uppercase flex items-center gap-3 group"
      >
        <span className="group-hover:translate-x-1 transition-transform duration-300">Chiudi</span>
        <span className="text-[#D4AF37] text-xl leading-none">×</span>
      </button>

      {/* Navigation links */}
      <nav>
        <ul className="flex flex-col items-center gap-6 md:gap-8">
          {links.map((link, i) => (
            <li
              key={link.href}
              ref={el => { linksRef.current[i] = el; }}
              className="overflow-hidden"
            >
              <Link
                href={link.href}
                onClick={close}
                className="block text-5xl md:text-7xl font-serif text-white/80 hover:text-[#D4AF37] transition-colors duration-500 tracking-tight leading-tight group"
              >
                <span className="relative inline-block group-hover:translate-x-3 transition-transform duration-500">
                  {link.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom info */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-between px-8 md:px-20 text-white/30 text-[10px] tracking-[0.2em] uppercase">
        <span>Il Veliero — San Vito Lo Capo</span>
        <span>+39 0923 000000</span>
      </div>
    </div>
  );
}
