import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import gsap from 'gsap';
import { useNav } from './NavigationContext';

type Section =
  | { kind: 'list'; label: string; items: { title: string; meta?: string; href?: string }[] }
  | { kind: 'gallery'; label: string; count: number }
  | { kind: 'text'; label: string; body: React.ReactNode };

const SECTIONS: Section[] = [
  {
    kind: 'list',
    label: 'Blog',
    items: [
      { title: 'I venti del Mediterraneo, raccontati al tramonto', meta: '5 min · 12.04.2026', href: '/blog' },
      { title: 'San Vito Lo Capo in primavera, una guida intima', meta: '7 min · 28.03.2026', href: '/blog' },
      { title: 'La famiglia Valenti — quattro generazioni di ospitalità', meta: '4 min · 02.03.2026', href: '/blog' },
      { title: 'Cous Cous Fest, oltre la festa: i sapori autentici', meta: '6 min · 15.02.2026', href: '/blog' },
    ],
  },
  {
    kind: 'list',
    label: 'Camere',
    items: [
      { title: 'Scirocco', meta: 'Vista mare · 35 m²', href: '/rooms' },
      { title: 'Mistral', meta: 'Terrazza privata · 28 m²', href: '/rooms' },
      { title: 'Gelsomino', meta: 'Giardino · 22 m²', href: '/rooms' },
      { title: 'Tramontana', meta: 'Vista monte · 30 m²', href: '/rooms' },
    ],
  },
  {
    kind: 'gallery',
    label: 'Galleria',
    count: 40,
  },
  {
    kind: 'text',
    label: 'About',
    body: (
      <p className="text-white/70 leading-relaxed text-sm md:text-base font-light max-w-2xl">
        Il Veliero è un albergo diffuso a conduzione familiare, nel cuore di
        San Vito Lo Capo. La famiglia Valenti accoglie i suoi ospiti dal
        1987 con l'autenticità di chi conosce ogni vento, ogni vicolo e ogni
        sapore di questa terra. Tre dimore, tre anime, una sola promessa —
        farvi sentire a casa, davanti al mare.
      </p>
    ),
  },
  {
    kind: 'text',
    label: 'Contatti',
    body: (
      <div className="text-white/70 text-sm md:text-base font-light space-y-3 leading-relaxed">
        <div>
          <span className="block text-[10px] tracking-[0.3em] uppercase text-[#D4AF37] mb-1">Indirizzo</span>
          Via Savoia, 19 — 91010 San Vito Lo Capo (TP), Sicilia
        </div>
        <div>
          <span className="block text-[10px] tracking-[0.3em] uppercase text-[#D4AF37] mb-1">Telefono</span>
          +39 0923 000 000
        </div>
        <div>
          <span className="block text-[10px] tracking-[0.3em] uppercase text-[#D4AF37] mb-1">Email</span>
          info@ilveliero.it
        </div>
      </div>
    ),
  },
];

export default function Navigation() {
  const { isOpen, close } = useNav();
  const overlayRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!overlayRef.current) return;
    tlRef.current = gsap.timeline({ paused: true })
      .fromTo(
        overlayRef.current,
        { yPercent: -100, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.6, ease: 'power3.inOut' }
      );
    return () => {
      tlRef.current?.kill();
      tlRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!tlRef.current) return;
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      tlRef.current.play();
    } else {
      document.body.style.overflow = '';
      tlRef.current.reverse();
      // Reset the open accordion when the menu closes so it starts
      // fresh next time.
      setOpenIdx(null);
    }
  }, [isOpen]);

  // Escape-key closes the overlay (basic dialog accessibility).
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, close]);

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Menu di navigazione"
      aria-hidden={!isOpen}
      className="fixed inset-0 z-[200] bg-[#0A1128] overflow-y-auto"
      style={{
        pointerEvents: isOpen ? 'all' : 'none',
        opacity: 0,
        transform: 'translateY(-100%)',
      }}
      data-testid="nav-overlay"
    >
      {/* Close button — fixed top-right */}
      <button
        onClick={close}
        className="fixed top-6 right-6 md:top-8 md:right-8 text-white/60 hover:text-[#D4AF37] transition-colors text-xs tracking-[0.3em] uppercase flex items-center gap-3 group z-10 bg-[#0A1128]/70 backdrop-blur-sm px-3 py-2"
        data-testid="btn-menu-close"
      >
        <span className="group-hover:translate-x-1 transition-transform duration-300">Chiudi</span>
        <span className="text-[#D4AF37] text-xl leading-none">×</span>
      </button>

      <div className="max-w-4xl mx-auto px-6 md:px-10 pt-24 pb-32">
        {/* Always-visible Home link at the top */}
        <Link
          href="/"
          onClick={close}
          className="block text-3xl md:text-5xl font-serif text-white/80 hover:text-[#D4AF37] transition-colors duration-500 tracking-tight mb-2 py-4 border-b border-white/10"
          data-testid="nav-link-home"
        >
          <span className="inline-block hover:translate-x-3 transition-transform duration-500">Home</span>
        </Link>

        {/* Accordion sections */}
        {SECTIONS.map((section, i) => {
          const isOpenSection = openIdx === i;
          return (
            <div
              key={section.label}
              className="border-b border-white/10"
              data-testid={`nav-section-${section.label.toLowerCase()}`}
            >
              <button
                id={`nav-toggle-${i}`}
                onClick={() => setOpenIdx(isOpenSection ? null : i)}
                aria-expanded={isOpenSection}
                aria-controls={`nav-panel-${i}`}
                className="w-full text-left py-4 md:py-5 flex justify-between items-center group"
                data-testid={`nav-toggle-${section.label.toLowerCase()}`}
              >
                <span className={`text-3xl md:text-5xl font-serif tracking-tight transition-colors duration-500 ${isOpenSection ? 'text-[#D4AF37]' : 'text-white/80 group-hover:text-[#D4AF37]'}`}>
                  {section.label}
                </span>
                <span className={`text-[#D4AF37] text-2xl md:text-3xl font-thin transition-transform duration-500 ${isOpenSection ? 'rotate-45' : ''}`}>
                  +
                </span>
              </button>

              <div
                id={`nav-panel-${i}`}
                role="region"
                aria-labelledby={`nav-toggle-${i}`}
                hidden={!isOpenSection}
                className={`overflow-hidden transition-all duration-700 ease-out ${
                  isOpenSection ? 'max-h-[1400px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="pb-8 md:pb-10 pt-2">
                  {section.kind === 'list' && (
                    <ul className="space-y-1">
                      {section.items.map((item, j) => (
                        <li key={`${section.label}-${j}`}>
                          {item.href ? (
                            <Link
                              href={item.href}
                              onClick={close}
                              className="group flex items-baseline justify-between gap-6 py-2.5 md:py-3 border-l-2 border-transparent hover:border-[#D4AF37] hover:pl-4 pl-2 transition-all duration-500"
                            >
                              <span className="text-base md:text-lg font-serif text-white/85 group-hover:text-white transition-colors">
                                {item.title}
                              </span>
                              {item.meta && (
                                <span className="text-[10px] md:text-[11px] tracking-[0.2em] uppercase text-white/40 font-light shrink-0">
                                  {item.meta}
                                </span>
                              )}
                            </Link>
                          ) : (
                            <div className="flex items-baseline justify-between gap-6 py-2.5 md:py-3 pl-2">
                              <span className="text-base md:text-lg font-serif text-white/85">
                                {item.title}
                              </span>
                              {item.meta && (
                                <span className="text-[10px] md:text-[11px] tracking-[0.2em] uppercase text-white/40 font-light shrink-0">
                                  {item.meta}
                                </span>
                              )}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}

                  {section.kind === 'gallery' && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 md:gap-3">
                      {Array.from({ length: section.count }, (_, j) => (
                        <div
                          key={`thumb-${j}`}
                          className="aspect-square bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/10 hover:border-[#D4AF37]/40 transition-colors duration-500 flex items-center justify-center group cursor-pointer"
                          data-testid={`gallery-thumb-${j + 1}`}
                        >
                          <span className="text-[9px] tracking-[0.2em] uppercase text-white/30 font-light group-hover:text-[#D4AF37] transition-colors">
                            Foto {String(j + 1).padStart(2, '0')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.kind === 'text' && (
                    <div className="pl-2">{section.body}</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Bottom signature */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-white/30 text-[10px] tracking-[0.2em] uppercase">
          <span>Il Veliero — San Vito Lo Capo</span>
          <span className="text-[#D4AF37]/60">+39 0923 000 000</span>
        </div>
      </div>
    </div>
  );
}
