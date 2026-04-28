import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const heroBgRef = useRef<HTMLDivElement>(null);
  const heroBookingRef = useRef<HTMLDivElement>(null);
  const heroLine1Ref = useRef<HTMLHeadingElement>(null);
  const heroLine2Ref = useRef<HTMLHeadingElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const logoSvgRef = useRef<SVGSVGElement>(null);
  const scrollProgressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

    // Logo sway on SVG only — not the whole header group
    gsap.to(logoSvgRef.current, {
      rotation: 1.2,
      duration: 3,
      ease: 'power1.inOut',
      repeat: -1,
      yoyo: true,
      transformOrigin: '50% 80%',
    });

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

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <>
      {/* Scroll progress bar — fixed at very top */}
      <div
        ref={scrollProgressRef}
        className="fixed top-0 left-0 h-0.5 bg-[#D4AF37] w-full origin-left scale-x-0 z-[60]"
      />

      {/* Header */}
      <header className="absolute top-0 left-0 w-full px-8 py-6 z-50 flex justify-between items-center text-white">
        <div ref={logoRef} className="group relative flex items-center gap-3 cursor-pointer">
          <div className="relative">
            <svg ref={logoSvgRef} width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 transition-transform duration-700 group-hover:scale-110">
              <path d="M12 3L20 15H4L12 3Z" stroke="#D4AF37" strokeWidth="1" fill="currentColor" fillOpacity="0.1"/>
              <path d="M12 21V15" stroke="#D4AF37" strokeWidth="1"/>
              <path d="M4 15C4 18.3137 7.58172 21 12 21C16.4183 21 20 18.3137 20 15" stroke="#D4AF37" strokeWidth="1" strokeDasharray="2 2"/>
            </svg>
            {/* Ripple ring on hover */}
            <span className="absolute inset-0 rounded-full border border-[#D4AF37]/60 scale-50 opacity-0 group-hover:scale-150 group-hover:opacity-0 transition-all duration-700 ease-out pointer-events-none" />
            {/* Wave line under keel */}
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-px bg-[#D4AF37] opacity-0 group-hover:opacity-40 group-hover:w-12 transition-all duration-700" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg tracking-[0.3em] font-serif uppercase leading-none">il veliero</span>
            <span className="text-[9px] tracking-[0.4em] text-[#D4AF37] uppercase mt-1 opacity-60">Tradizione &amp; Vento</span>
          </div>
        </div>
        <div
          className="text-xs tracking-widest uppercase cursor-pointer hover:text-[#D4AF37] transition-colors relative overflow-hidden group"
          data-testid="btn-menu"
        >
          Menu
          <span className="absolute bottom-0 left-0 w-full h-px bg-[#D4AF37] translate-x-[-105%] group-hover:translate-x-0 transition-transform duration-300 origin-left" />
        </div>
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
