import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNav } from '@/components/NavigationContext';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const { toggle } = useNav();
  const heroBgRef = useRef<HTMLDivElement>(null);
  const heroBookingRef = useRef<HTMLDivElement>(null);
  const heroLine1Ref = useRef<HTMLHeadingElement>(null);
  const heroLine2Ref = useRef<HTMLHeadingElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const logoSvgRef = useRef<SVGSVGElement>(null);
  const sailboatRef = useRef<HTMLDivElement>(null);
  const sailboatSwayRef = useRef<HTMLDivElement>(null);
  const scrollProgressRef = useRef<HTMLDivElement>(null);
  const [headerScrolled, setHeaderScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setHeaderScrolled(window.scrollY > window.innerHeight * 0.6);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    // Scope all Hero-owned tweens/triggers so their cleanup does NOT touch
    // ScrollTriggers owned by sibling overlays (SailingVoyager, OceanicAtmosphere).
    const ctx = gsap.context(() => {
    const introTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    introTl.fromTo(
      heroBgRef.current,
      { scale: 1.1 },
      { scale: 1, duration: 3, ease: 'power2.out' }
    )
    .fromTo(
      [heroLine1Ref.current, heroLine2Ref.current],
      { y: 100 },
      { y: 0, duration: 1.2, stagger: 0.15 },
      '-=2'
    )
    .fromTo(
      heroBookingRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1 },
      '-=1'
    );

    // Hero background parallax
    gsap.to(heroBgRef.current, {
      yPercent: 40,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });

    // Continuous gentle sway — applied to the inner element so it does NOT
    // conflict with the outer scroll-driven rotation.
    if (sailboatSwayRef.current) {
      gsap.to(sailboatSwayRef.current, {
        rotation: 3,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
        transformOrigin: 'center bottom',
      });
    }

    // NOTE: The hero sailboat scroll-translate (x:60vw / y:20vh / rotation:15
    // / opacity:0) was intentionally removed. The header logo's sailboat must
    // stay anchored top-left; only the gentle ±3° sway on sailboatSwayRef
    // remains. The "background voyager" sailboat that drifts diagonally
    // across the page lives in <SailingVoyager /> and is mounted globally
    // from App.tsx.

    // Scroll progress bar
    gsap.to(scrollProgressRef.current, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3,
      },
    });

    // Marquee infinite scroll
    if (marqueeRef.current) {
      const inner = marqueeRef.current.querySelector<HTMLElement>('.marquee-inner');
      if (inner) {
        inner.style.willChange = 'transform';
        gsap.to(inner, { xPercent: -50, ease: 'none', duration: 35, repeat: -1 });
      }
    }

    });

    return () => ctx.revert();
  }, []);

  return (
    <>
      {/* Scroll progress bar — fixed at very top */}
      <div
        ref={scrollProgressRef}
        className="fixed top-0 left-0 h-0.5 bg-[#D4AF37] w-full origin-left scale-x-0 z-[60]"
      />

      {/* Header — fixed so the sailboat stays in viewport while it sails away.
          Adds a glassmorphic backdrop once the user scrolls past the hero so
          the white text stays readable on light sections below. */}
      <header
        className={`fixed top-0 left-0 w-full px-8 py-6 z-50 flex justify-between items-center text-white transition-all duration-500 ${
          headerScrolled ? 'bg-[#0A1128]/75 backdrop-blur-md' : ''
        }`}
      >
        <div className="flex items-center gap-4 group cursor-pointer relative z-50">
          <div className="relative">
            <div
              ref={sailboatRef}
              className="relative z-50 transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-110"
            >
              <div ref={sailboatSwayRef}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="text-white drop-shadow-xl">
                  <path d="M12 2L20 14H4L12 2Z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1"/>
                  <path d="M12 22V14" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M5 14C5 14 8 16 12 16C16 16 19 14 19 14" stroke="#D4AF37" strokeWidth="1" strokeDasharray="3 3" className="opacity-70"/>
                </svg>
              </div>
            </div>
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-[1px] bg-[#D4AF37] scale-x-0 group-hover:scale-x-150 group-hover:opacity-40 transition-all duration-700 origin-center" />
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-3 h-[1px] bg-[#D4AF37] scale-x-0 group-hover:scale-x-125 group-hover:opacity-30 transition-all duration-700 delay-150 origin-center" />
          </div>
          <div className="flex flex-col flex-shrink-0">
            <span className="text-xl tracking-[0.3em] font-serif uppercase text-white leading-none">
              il veliero
            </span>
            <span className="text-[10px] tracking-[0.4em] text-[#D4AF37] uppercase mt-1.5 opacity-80 font-light">
              Tradizione &amp; Vento
            </span>
          </div>
        </div>
        <button
          onClick={toggle}
          className="text-xs tracking-widest uppercase cursor-pointer hover:text-[#D4AF37] transition-colors relative overflow-hidden group bg-transparent border-none"
          data-testid="btn-menu"
        >
          Menu
          <span className="absolute bottom-0 left-0 w-full h-px bg-[#D4AF37] translate-x-[-105%] group-hover:translate-x-0 transition-transform duration-300 origin-left" />
        </button>
      </header>

      {/* Full-screen hero */}
      <section className="hero-section relative w-full h-screen overflow-hidden bg-[#0A1128]">
        <div
          ref={heroBgRef}
          className="absolute inset-0 w-full h-full bg-cover bg-center opacity-90"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=2000&auto=format&fit=crop')",
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-4 -mt-10">
          <div className="overflow-hidden mb-2">
            <h1
              ref={heroLine1Ref}
              className="text-5xl md:text-7xl font-serif text-white font-light tracking-tight drop-shadow-sm"
              style={{ transform: 'translateY(100%)' }}
            >
              Dove il Mare
            </h1>
          </div>
          <div className="overflow-hidden mb-12">
            <h1
              ref={heroLine2Ref}
              className="text-5xl md:text-7xl font-serif text-white italic font-light tracking-tight drop-shadow-sm"
              style={{ transform: 'translateY(100%)' }}
            >
              Incontra il Cielo
            </h1>
          </div>
        </div>

        {/* Booking widget */}
        <div
          ref={heroBookingRef}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 w-[95%] max-w-5xl bg-black/20 backdrop-blur-md border border-white/10 flex flex-col md:flex-row justify-between items-stretch shadow-2xl opacity-0"
        >
          <div className="flex-1 flex justify-around w-full px-6 py-4 text-white text-sm items-center">
            <div className="flex flex-col items-start cursor-pointer group" data-testid="widget-checkin">
              <span className="text-[10px] text-white/50 uppercase tracking-[0.15em] mb-1 group-hover:text-white transition-colors">Arrivo</span>
              <span className="font-light tracking-wide">28.04.2026</span>
            </div>
            <div className="w-px h-8 bg-white/10 mx-2" />
            <div className="flex flex-col items-start cursor-pointer group" data-testid="widget-checkout">
              <span className="text-[10px] text-white/50 uppercase tracking-[0.15em] mb-1 group-hover:text-white transition-colors">Partenza</span>
              <span className="font-light tracking-wide">30.04.2026</span>
            </div>
            <div className="w-px h-8 bg-white/10 mx-2" />
            <div className="flex flex-col items-start cursor-pointer group" data-testid="widget-guests">
              <span className="text-[10px] text-white/50 uppercase tracking-[0.15em] mb-1 group-hover:text-white transition-colors">Ospiti</span>
              <span className="font-light tracking-wide">2 Adulti</span>
            </div>
          </div>
          <button
            className="bg-[#D4AF37] text-black px-10 py-4 md:py-0 uppercase text-[11px] tracking-[0.2em] font-medium transition-all duration-500 w-full md:w-auto hover:shadow-xl relative overflow-hidden group"
            data-testid="btn-prenota"
          >
            <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[#0A1128]">Prenota Ora</span>
            <span className="absolute inset-0 bg-white scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
          </button>
        </div>
      </section>

      {/* Marquee band */}
      <section className="bg-[#0A1128] overflow-hidden py-4 border-y border-white/5">
        <div ref={marqueeRef} className="relative flex whitespace-nowrap">
          <div className="marquee-inner flex text-[#5BB8E8] uppercase tracking-[0.2em] text-xs font-light">
            {[...Array(4)].map((_, i) => (
              <span key={i} className="mx-4">
                Autentico Artigianato Siciliano • Mare e Vento • San Vito Lo Capo •
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
