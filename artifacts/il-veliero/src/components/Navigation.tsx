import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import gsap from 'gsap';
import { useNav } from './NavigationContext';

type SubItem = { title: string; meta?: string; href?: string };

type Section =
  | { kind: 'list'; label: string; href: string; items: SubItem[] }
  | { kind: 'gallery'; label: string; href: string; count: number }
  | { kind: 'anchor'; label: string; anchor: string; body: React.ReactNode };

const SECTIONS: Section[] = [
  {
    kind: 'list',
    label: 'Blog',
    href: '/blog',
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
    href: '/rooms',
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
    href: '/gallery',
    count: 40,
  },
  {
    kind: 'anchor',
    label: 'About',
    anchor: 'about',
    body: (
      <p className="text-white/70 leading-relaxed text-sm md:text-base font-light max-w-2xl">
        Il Veliero è un albergo diffuso a conduzione familiare, nel cuore di
        San Vito Lo Capo. La famiglia Valenti accoglie i suoi ospiti dal
        1987 con l'autenticità di chi conosce ogni vento, ogni vicolo e ogni
        sapore di questa terra.
      </p>
    ),
  },
  {
    kind: 'anchor',
    label: 'Contact us',
    anchor: 'footer',
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
  const [, setLocation] = useLocation();

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
    }
  }, [isOpen]);

  // Escape closes
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, close]);

  // Smooth-scroll to an in-page anchor. If the user is on a different page,
  // navigate home first, then scroll on the next frame.
  const scrollToAnchor = (anchorId: string) => {
    close();
    const doScroll = () => {
      // Wait one frame so the menu close animation begins and the target
      // node is mounted.
      requestAnimationFrame(() => {
        const el = document.getElementById(anchorId);
        if (!el) return;
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    };
    if (window.location.pathname.replace(/\/$/, '') !== (import.meta.env.BASE_URL || '/').replace(/\/$/, '')) {
      setLocation('/');
      // Allow the home page to mount its sections before scrolling.
      setTimeout(doScroll, 350);
    } else {
      doScroll();
    }
  };

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
      {/* Close button */}
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
          className="block text-3xl md:text-5xl font-serif text-white/80 hover:text-[#D4AF37] transition-colors duration-500 tracking-tight py-4 border-b border-white/10"
          data-testid="nav-link-home"
        >
          <span className="inline-block hover:translate-x-3 transition-transform duration-500">Home</span>
        </Link>

        {/* Flat list — every section is fully visible. Clicking the big
            label navigates / scrolls; sub-items appear immediately below. */}
        {SECTIONS.map((section) => {
          const labelClass =
            'group inline-block text-3xl md:text-5xl font-serif tracking-tight text-white/80 hover:text-[#D4AF37] transition-colors duration-500';

          const labelNode = section.kind === 'anchor' ? (
            <button
              type="button"
              onClick={() => scrollToAnchor(section.anchor)}
              className={`${labelClass} text-left`}
              data-testid={`nav-link-${section.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <span className="inline-block group-hover:translate-x-3 transition-transform duration-500">
                {section.label}
              </span>
            </button>
          ) : (
            <Link
              href={section.href}
              onClick={close}
              className={labelClass}
              data-testid={`nav-link-${section.label.toLowerCase()}`}
            >
              <span className="inline-block group-hover:translate-x-3 transition-transform duration-500">
                {section.label}
              </span>
            </Link>
          );

          return (
            <div
              key={section.label}
              className="border-b border-white/10 py-6 md:py-8"
              data-testid={`nav-section-${section.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {labelNode}

              <div className="mt-5 md:mt-6">
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
                            <span className="text-base md:text-lg font-serif text-white/80 group-hover:text-white transition-colors">
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
                            <span className="text-base md:text-lg font-serif text-white/80">
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
                  <Link
                    href={section.href}
                    onClick={close}
                    className="block"
                    aria-label="Apri la galleria completa"
                  >
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 gap-2">
                      {Array.from({ length: section.count }, (_, j) => (
                        <div
                          key={`thumb-${j}`}
                          className="aspect-square bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/10 hover:border-[#D4AF37]/40 transition-colors duration-500 flex items-center justify-center group"
                          data-testid={`gallery-thumb-${j + 1}`}
                        >
                          <span className="text-[8px] tracking-[0.15em] uppercase text-white/30 font-light group-hover:text-[#D4AF37] transition-colors">
                            {String(j + 1).padStart(2, '0')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Link>
                )}

                {section.kind === 'anchor' && (
                  <div className="pl-2">{section.body}</div>
                )}
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
