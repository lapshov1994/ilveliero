import React, { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Play, Star } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const heroBgRef = useRef<HTMLDivElement>(null);
  const heroBookingRef = useRef<HTMLDivElement>(null);
  const heroLine1Ref = useRef<HTMLDivElement>(null);
  const heroLine2Ref = useRef<HTMLDivElement>(null);
  const heading1Ref = useRef<HTMLDivElement>(null);
  const heading2Ref = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const vibeVideoRef = useRef<HTMLDivElement>(null);
  const gardenBgRef = useRef<HTMLDivElement>(null);
  const gardenMediaRef = useRef<HTMLDivElement>(null);
  const reviewItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  // Editorial features refs
  const featBlock1Ref = useRef<HTMLDivElement>(null);
  const featBg1Ref = useRef<HTMLDivElement>(null);
  const featBlock2Ref = useRef<HTMLDivElement>(null);
  const featBg3Ref = useRef<HTMLDivElement>(null);
  const featBlock3TextRef = useRef<HTMLDivElement>(null);
  const featBlock4Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Lenis
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // GSAP Intro Timeline (cinematic entrance on load)
    const introTl = gsap.timeline({ defaults: { ease: "power3.out" } });
    if (heroBgRef.current) {
      introTl.fromTo(
        heroBgRef.current,
        { scale: 1.1 },
        { scale: 1, duration: 3, ease: "power2.out" }
      );
    }
    if (heroLine1Ref.current && heroLine2Ref.current) {
      introTl.fromTo(
        [heroLine1Ref.current, heroLine2Ref.current],
        { y: 100 },
        { y: 0, duration: 1.2, stagger: 0.15 },
        "-=2"
      );
    }
    if (heroBookingRef.current) {
      introTl.fromTo(
        heroBookingRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1 },
        "-=1"
      );
    }

    // GSAP Scroll Animations
    // 1. Hero Parallax
    if (heroBgRef.current) {
      gsap.to(heroBgRef.current, {
        yPercent: 40,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }

    // 2. Text Reveals
    const animateTextReveal = (element: HTMLElement | null) => {
      if (!element) return;
      const lines = element.querySelectorAll(".reveal-line");
      if (!lines.length) return;
      gsap.fromTo(
        lines,
        { y: "100%" },
        {
          y: "0%",
          duration: 1.2,
          stagger: 0.15,
          ease: "power4.out",
          scrollTrigger: {
            trigger: element,
            start: "top 85%",
          },
        }
      );
    };

    animateTextReveal(heading1Ref.current);
    animateTextReveal(heading2Ref.current);

    // 3. Marquee (GSAP approach)
    if (marqueeRef.current) {
      const marqueeInner = marqueeRef.current.querySelector(".marquee-inner");
      if (marqueeInner) {
        gsap.to(marqueeInner, {
          xPercent: -50,
          ease: "none",
          duration: 20,
          repeat: -1,
        });
      }
    }

    // 4. Editorial Features — asynchronous "oil scroll" animations

    // Block 1 garden: subtle parallax (slower than scroll)
    if (featBg1Ref.current && featBlock1Ref.current) {
      gsap.to(featBg1Ref.current, {
        yPercent: 18,
        ease: "none",
        scrollTrigger: {
          trigger: featBlock1Ref.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5,
        },
      });
    }

    // Block 2 beach: slides in from right, delayed relative to Block 1
    if (featBlock2Ref.current) {
      gsap.fromTo(
        featBlock2Ref.current,
        { opacity: 0, x: 50 },
        {
          opacity: 1,
          x: 0,
          duration: 1.6,
          ease: "power3.out",
          scrollTrigger: {
            trigger: featBlock2Ref.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }

    // Block 3 host family photo: slow scale-in (1.08 → 1)
    if (featBg3Ref.current) {
      const inner3 = featBg3Ref.current.querySelector<HTMLElement>(".media-inner-3");
      if (inner3) {
        gsap.fromTo(
          inner3,
          { scale: 1.08 },
          {
            scale: 1,
            duration: 2.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: featBg3Ref.current,
              start: "top 75%",
            },
          }
        );
      }
    }

    // Block 3 text: fades in slightly after photo
    if (featBlock3TextRef.current) {
      gsap.fromTo(
        featBlock3TextRef.current,
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 1.4,
          ease: "power3.out",
          delay: 0.25,
          scrollTrigger: {
            trigger: featBlock3TextRef.current,
            start: "top 78%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }

    // Block 4 location: gentle fade-up
    if (featBlock4Ref.current) {
      gsap.fromTo(
        featBlock4Ref.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: featBlock4Ref.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }

    // 5. Garden bg parallax
    if (gardenBgRef.current) {
      gsap.to(gardenBgRef.current, {
        yPercent: 15,
        ease: "none",
        scrollTrigger: {
          trigger: gardenBgRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.8,
        },
      });
    }

    // Garden media scale-in
    if (gardenMediaRef.current) {
      gsap.fromTo(
        gardenMediaRef.current,
        { scale: 1.08, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: gardenMediaRef.current,
            start: "top 78%",
          },
        }
      );
    }

    // 6. Reviews stagger — organic asynchronous reveal
    reviewItemsRef.current.forEach((item, i) => {
      if (!item) return;
      gsap.fromTo(
        item,
        { opacity: 0, y: 50 + i * 10 },
        {
          opacity: 1,
          y: 0,
          duration: 1.4,
          ease: "power3.out",
          delay: i * 0.12,
          scrollTrigger: {
            trigger: item,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });

    // Generic fade-up for section labels
    document.querySelectorAll(".section-title-reveal").forEach((el) => {
      gsap.fromTo(
        el,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
          },
        }
      );
    });

    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-secondary/30 selection:text-foreground overflow-x-hidden">
      {/* 1. Header — always transparent, sits over the photo */}
      <header className="absolute top-0 left-0 w-full px-8 py-6 z-50 flex justify-between items-center text-white">
        <div className="flex items-center gap-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white">
            <path d="M12 2L20 14H4L12 2Z" fill="currentColor" fillOpacity="0.2" />
            <path d="M12 22V14" />
          </svg>
          <div className="text-lg tracking-[0.2em] font-serif uppercase">
            il veliero <span className="text-[#D4AF37] ml-1 text-xs">★★★</span>
          </div>
        </div>
        <div
          className="text-xs tracking-widest uppercase cursor-pointer hover:text-[#D4AF37] transition-colors"
          data-testid="btn-menu"
        >
          Menu
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="hero-section relative w-full h-screen overflow-hidden bg-[#0A1128]">
        {/* Background Media */}
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

        {/* Main Content — shifted slightly above center for visual balance */}
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-4 -mt-10">
          <div className="overflow-hidden mb-2">
            <h1
              ref={heroLine1Ref}
              className="text-5xl md:text-7xl font-serif text-white font-light tracking-tight drop-shadow-sm"
              style={{ transform: "translateY(100%)" }}
            >
              Dove il Mare
            </h1>
          </div>
          <div className="overflow-hidden mb-12">
            <h1
              ref={heroLine2Ref}
              className="text-5xl md:text-7xl font-serif text-white italic font-light tracking-tight drop-shadow-sm"
              style={{ transform: "translateY(100%)" }}
            >
              Incontra il Cielo
            </h1>
          </div>
        </div>

        {/* Booking Widget — slim, elegant, full-width with padding */}
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
            className="bg-[#D4AF37] text-black px-10 py-4 md:py-0 uppercase text-[11px] tracking-[0.2em] font-medium hover:bg-white transition-all duration-500 w-full md:w-auto"
            data-testid="btn-prenota"
          >
            Prenota Ora
          </button>
        </div>
      </section>

      {/* 3. Marquee Band */}
      <section className="bg-primary overflow-hidden py-4 border-y border-primary/90">
        <div ref={marqueeRef} className="relative flex whitespace-nowrap">
          <div className="marquee-inner flex text-secondary uppercase tracking-[0.2em] text-xs font-light">
            {[...Array(4)].map((_, i) => (
              <span key={i} className="mx-4">
                Autentico Artigianato Siciliano • Mare e Vento • San Vito Lo Capo •
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Editorial Features — "72 Ore Perfette" */}
      <section className="relative bg-white text-[#0A1128] overflow-hidden" id="posizione">

        {/* Subtle Sicilian maiolica texture — sky-blue diamonds at 3% opacity */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <svg className="absolute top-0 left-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="maiolica" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <polygon points="30,4 56,30 30,56 4,30" fill="none" stroke="#5BB8E8" strokeWidth="1"/>
                <circle cx="30" cy="30" r="3" fill="#5BB8E8"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#maiolica)"/>
          </svg>
        </div>

        {/* ── Block 1 + 2 row ── */}
        <div ref={featBlock1Ref} className="relative max-w-[1600px] mx-auto px-6 md:px-12 pt-32 pb-0">
          <div className="grid grid-cols-12 gap-4 items-start">

            {/* Block 1 — Morning Garden (large, 7 cols) */}
            <div className="col-span-12 md:col-span-7 relative overflow-hidden" data-testid="feature-block-1">
              {/* Watermark 01 */}
              <span className="absolute -top-6 -left-2 font-serif text-[180px] leading-none text-[#0A1128] opacity-[0.04] select-none z-0 pointer-events-none">
                01
              </span>
              {/* Garden image — parallax target */}
              <div className="relative w-full aspect-[4/5] overflow-hidden">
                <div
                  ref={featBg1Ref}
                  className="absolute inset-0 w-full h-[130%] -top-[15%] bg-cover bg-center"
                  style={{ background: "linear-gradient(160deg, #0f2a1e 0%, #1a4a30 30%, #2a6040 55%, #1a3a50 80%, #0A1128 100%)" }}
                >
                  {/* Light jasmine/dew texture overlay */}
                  <div className="absolute inset-0 bg-black/25" />
                  <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
                {/* Text overlay — top-left, slightly offset */}
                <div className="absolute top-10 left-10 z-10 text-white max-w-xs">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-white/50 mb-3 font-sans">Alba in giardino</p>
                  <h2 className="font-serif text-4xl md:text-5xl font-light leading-tight mb-5 drop-shadow-sm">
                    Un risveglio<br/>profumato.
                  </h2>
                  <p className="text-sm font-light text-white/70 leading-relaxed max-w-[220px]">
                    Il gelsomino entra dalla finestra. In giardino ti aspettano dolci fatti in casa, caffè forte, e il suono delle rondini sul tetto.
                  </p>
                </div>
              </div>
            </div>

            {/* Block 2 — Beach column (4 cols, overlapping left block, shifted up) */}
            <div
              ref={featBlock2Ref}
              className="col-span-12 md:col-span-4 md:-mt-16 md:-ml-6 z-10 relative"
              data-testid="feature-block-2"
            >
              {/* Tall narrow beach image */}
              <div className="w-full overflow-hidden" style={{ aspectRatio: "3/5" }}>
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{ background: "linear-gradient(180deg, #87ceeb 0%, #b0ddf5 30%, #d8eefc 55%, #e8f4f8 75%, #f5f0e8 100%)" }}
                >
                  <div className="absolute inset-0 bg-white/10" />
                </div>
              </div>
              {/* Text — sand-yellow accent, right of image context */}
              <div className="mt-8 pl-5 border-l-2 border-[#D4AF37]/40">
                <span className="text-[#D4AF37] text-[10px] uppercase tracking-[0.2em] font-sans block mb-2">
                  02 — Purezza Assoluta
                </span>
                <h3 className="font-serif text-2xl md:text-3xl text-[#0A1128] mb-4 leading-tight">
                  A due passi<br/>dall'acqua
                </h3>
                <p className="text-sm text-[#0A1128]/70 font-light leading-relaxed">
                  Tre minuti esatti a piedi. La sabbia di San Vito è tra le più bianche d'Europa. La pulizia non è un dettaglio — è la nostra ossessione.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* ── Block 3 — Host Family ── */}
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-32">
          <div className="grid grid-cols-12 gap-8 md:gap-16 items-center">

            {/* Photo — host family portrait */}
            <div ref={featBg3Ref} className="col-span-12 md:col-span-5 overflow-hidden relative" data-testid="feature-block-3-photo">
              <div className="w-full overflow-hidden" style={{ aspectRatio: "4/5" }}>
                <div
                  className="media-inner-3 w-full h-full bg-cover bg-center"
                  style={{
                    background: "linear-gradient(135deg, #1a2a3a 0%, #2a3d52 40%, #1e3048 70%, #0A1128 100%)",
                    transform: "scale(1.08)",
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* Silhouette placeholder */}
                    <div className="flex flex-col items-center gap-3 opacity-20">
                      <div className="w-16 h-16 rounded-full bg-white/60" />
                      <div className="w-10 h-10 rounded-full bg-white/60" />
                      <div className="w-24 h-1 bg-white/40 rounded" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 h-1/4 bg-gradient-to-t from-[#0A1128]/60 to-transparent" />
                  {/* Family credit */}
                  <div className="absolute bottom-6 left-6 text-white/50 text-[10px] uppercase tracking-widest font-sans">
                    La Famiglia Valenti
                  </div>
                </div>
              </div>
            </div>

            {/* Text — right-aligned beside photo */}
            <div
              ref={featBlock3TextRef}
              className="col-span-12 md:col-span-6 md:col-start-7"
              data-testid="feature-block-3-text"
            >
              <span className="absolute font-serif text-[200px] leading-none text-[#0A1128] opacity-[0.03] select-none -left-8 -top-8 pointer-events-none">
                03
              </span>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#D4AF37] font-sans mb-4">
                03 — Calore Siciliano
              </p>
              <h3 className="font-serif text-4xl md:text-5xl text-[#0A1128] leading-tight mb-6">
                Non sei un numero<br/>di stanza.
              </h3>
              <p className="text-base text-[#0A1128]/70 font-light leading-relaxed mb-8 max-w-md">
                Ti accogliamo con l'autentica ospitalità della nostra famiglia. Ogni mattina in giardino è unica — colazioni fatte in casa, conversazioni sincere, la sensazione di essere al sicuro.
              </p>
              <blockquote className="border-l-2 border-[#D4AF37]/50 pl-6">
                <p className="font-serif text-xl text-[#0A1128]/80 italic leading-relaxed">
                  "Ogni ospite è trattato come un membro della famiglia. San Vito è il nostro tesoro."
                </p>
                <cite className="block mt-3 text-[10px] uppercase tracking-widest text-[#0A1128]/50 not-italic font-sans">
                  — Famiglia Valenti, proprietari
                </cite>
              </blockquote>
            </div>

          </div>
        </div>

        {/* ── Block 4 — Location / Walkability ── */}
        <div
          ref={featBlock4Ref}
          className="pb-32 px-6 text-center max-w-lg mx-auto"
          data-testid="feature-block-4"
        >
          <div className="w-8 h-px bg-[#D4AF37]/50 mx-auto mb-8" />
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#D4AF37] font-sans block mb-4">
            04 — Nel cuore della vita
          </span>
          <h3 className="font-serif text-3xl md:text-4xl text-[#0A1128] mb-5 leading-tight">
            Tutto è a portata<br/>di passeggiata.
          </h3>
          <p className="text-sm text-[#0A1128]/60 font-light leading-relaxed">
            Ristoranti, bar, il mercato del mattino. La vivacità di San Vito Lo Capo è fuori dalla porta. Sicuro, comodo, e deliziosamente a misura d'uomo.
          </p>
          <div className="w-8 h-px bg-[#D4AF37]/50 mx-auto mt-8" />
        </div>

      </section>

      {/* 5. Garden / Cinematic Narrative — "72 Ore Perfette" */}
      <section className="relative overflow-hidden bg-[#060e1c]" id="giardino">
        {/* Parallax background */}
        <div
          ref={gardenBgRef}
          className="absolute inset-0 w-full h-[130%] -top-[15%]"
          style={{ background: "linear-gradient(160deg, #060e1c 0%, #0d2236 35%, #0a1e30 65%, #060e1c 100%)" }}
        >
          <div className="absolute inset-0 opacity-[0.05]">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grain-garden" width="80" height="80" patternUnits="userSpaceOnUse">
                  <polygon points="40,6 74,40 40,74 6,40" fill="none" stroke="#5BB8E8" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grain-garden)"/>
            </svg>
          </div>
        </div>

        <div className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-12 py-32 md:py-48">
          <div className="grid grid-cols-12 gap-8 items-center">

            {/* Left — editorial text, varying scale */}
            <div className="col-span-12 lg:col-span-6">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#5BB8E8]/60 font-sans mb-8 section-title-reveal">
                San Vito Lo Capo, Sicilia
              </p>
              <div className="overflow-hidden mb-2">
                <h2
                  ref={heading2Ref}
                  className="reveal-line font-serif text-white font-light leading-[0.9] tracking-tight"
                  style={{ fontSize: "clamp(3.5rem, 8vw, 8rem)" }}
                >
                  72 Ore
                </h2>
              </div>
              <div className="overflow-hidden mb-14">
                <h2
                  className="reveal-line font-serif text-[#D4AF37] italic font-light leading-[0.9] tracking-tight"
                  style={{ fontSize: "clamp(3.5rem, 8vw, 8rem)" }}
                >
                  Perfette.
                </h2>
              </div>
              <div className="space-y-5 max-w-md section-title-reveal">
                <p className="text-white/60 font-light text-base leading-relaxed">
                  Svegliati con il profumo del gelsomino. Scendi in giardino — caffè caldo, dolci appena sfornati, l'ombra degli ulivi. Poi tre minuti a piedi e sei sull'acqua più azzurra del Mediterraneo.
                </p>
                <p className="text-white/35 font-light text-sm leading-relaxed">
                  Qui il tempo rallenta. Le giornate si misurano in onde, in tramonti che tingono il mare di rame, in sorrisi sinceri di chi ha scelto questo angolo di Sicilia come casa.
                </p>
              </div>
              <div className="mt-12 section-title-reveal">
                <button
                  className="border border-white/20 text-white/70 px-10 py-4 text-[10px] uppercase tracking-[0.25em] hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all duration-500"
                  data-testid="btn-scopri-giardino"
                >
                  Prenota il tuo soggiorno
                </button>
              </div>
            </div>

            {/* Right — stacked media placeholders */}
            <div className="col-span-12 lg:col-span-5 lg:col-start-8 flex flex-col gap-4">
              <div
                ref={gardenMediaRef}
                className="relative overflow-hidden cursor-pointer group"
                style={{ aspectRatio: "4/3", opacity: 0 }}
                data-testid="video-vibe"
              >
                <div
                  ref={vibeVideoRef}
                  className="media-inner absolute inset-0"
                  style={{ background: "linear-gradient(135deg, #0d2236 0%, #1a3a52 50%, #0d4a6e 100%)" }}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="w-14 h-14 rounded-full border border-white/25 flex items-center justify-center group-hover:border-[#D4AF37]/60 transition-all duration-500 group-hover:scale-110">
                      <Play size={18} fill="white" className="text-white ml-1 opacity-70" />
                    </div>
                    <span className="mt-4 text-[10px] tracking-[0.2em] uppercase text-white/30 font-sans">Il Giardino</span>
                  </div>
                  <span className="absolute bottom-5 left-6 text-white/15 font-serif text-xs">mattina · 07:30</span>
                </div>
              </div>
              <div className="relative overflow-hidden section-title-reveal" style={{ aspectRatio: "16/5" }}>
                <div
                  className="w-full h-full"
                  style={{ background: "linear-gradient(90deg, #87ceeb 0%, #b8ddf5 40%, #e0f2fa 70%, #f5f0e8 100%)" }}
                >
                  <div className="absolute inset-0 bg-black/5" />
                  <div className="absolute inset-0 flex items-center px-8">
                    <span className="text-[#0A1128]/40 font-serif italic text-lg">Tre minuti — e sei qui.</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Social Proof — editorial, no card frames */}
      <section className="relative bg-[#FAFAF8] overflow-hidden" id="recensioni">
        {/* Watermark surname */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden" aria-hidden="true">
          <span className="font-serif text-[20vw] text-[#0A1128] opacity-[0.025] select-none leading-none whitespace-nowrap tracking-tighter">
            Valenti
          </span>
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 py-32 md:py-40">

          {/* Central anchor quote */}
          <div
            ref={(el) => { reviewItemsRef.current[0] = el; }}
            className="max-w-3xl mx-auto text-center mb-32"
            data-testid="review-valenti"
          >
            <div className="flex justify-center gap-1 mb-10">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className="text-[#D4AF37] fill-[#D4AF37]" />
              ))}
            </div>
            <p className="font-serif text-3xl md:text-4xl lg:text-[2.8rem] text-[#0A1128] leading-tight italic font-light mb-8">
              "Ogni ospite è trattato come un membro della famiglia. San Vito è il nostro tesoro."
            </p>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#0A1128]/35 font-sans">
              — La Famiglia Valenti, proprietari
            </p>
          </div>

          {/* Three reviews — frameless, staggered heights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-[#0A1128]/10">

            <div
              ref={(el) => { reviewItemsRef.current[1] = el; }}
              className="py-12 md:py-0 md:pr-14"
              data-testid="review-card-0"
            >
              <div className="flex gap-1 mb-5">
                {[...Array(5)].map((_, i) => (<Star key={i} size={12} className="text-[#D4AF37] fill-[#D4AF37]" />))}
              </div>
              <p className="font-serif text-xl md:text-2xl text-[#0A1128] leading-relaxed mb-5 italic">
                "Ci siamo sentiti come a casa. La famiglia è calorosa — 3 minuti e sei sulla spiaggia più bella della Sicilia."
              </p>
              <p className="text-[9px] uppercase tracking-[0.25em] text-[#0A1128]/35 font-sans">
                Sofía M. — Madrid
              </p>
            </div>

            <div
              ref={(el) => { reviewItemsRef.current[2] = el; }}
              className="py-12 md:py-0 md:px-14 md:mt-20"
              data-testid="review-card-1"
            >
              <div className="flex gap-1 mb-5">
                {[...Array(5)].map((_, i) => (<Star key={i} size={12} className="text-[#D4AF37] fill-[#D4AF37]" />))}
              </div>
              <p className="font-serif text-xl text-[#0A1128] leading-relaxed mb-5 italic">
                "Pulizia, silenzio, ospitalità autentica. La colazione in giardino — indimenticabile."
              </p>
              <p className="text-[9px] uppercase tracking-[0.25em] text-[#0A1128]/35 font-sans mb-5">
                Thomas B. — Berlin
              </p>
              <p className="text-xs text-[#0A1128]/25 font-light leading-relaxed pt-5 border-t border-[#0A1128]/10">
                Camera impeccabile · asciugamani freschi ogni giorno · zero rumore
              </p>
            </div>

            <div
              ref={(el) => { reviewItemsRef.current[3] = el; }}
              className="py-12 md:py-0 md:pl-14 md:mt-10"
              data-testid="review-card-2"
            >
              <div className="flex gap-1 mb-5">
                {[...Array(5)].map((_, i) => (<Star key={i} size={12} className="text-[#D4AF37] fill-[#D4AF37]" />))}
              </div>
              <p className="font-serif text-xl text-[#0A1128] leading-relaxed mb-5 italic">
                "Un angolo di pace raro. Mi sono sentita completamente al sicuro e coccolata per tutta la settimana."
              </p>
              <p className="text-[9px] uppercase tracking-[0.25em] text-[#0A1128]/35 font-sans">
                Claire L. — Lyon
              </p>
            </div>

          </div>

          {/* CTA */}
          <div className="text-center mt-24 section-title-reveal">
            <button
              className="bg-[#D4AF37] text-[#0A1128] px-12 py-4 text-[10px] uppercase tracking-[0.25em] font-medium hover:bg-[#0A1128] hover:text-white transition-all duration-500"
              data-testid="btn-prenota-reviews"
            >
              Prenota Ora — Disponibilità Limitata
            </button>
          </div>

        </div>
      </section>

      {/* 7. Footer — asymmetric, airy */}
      <footer className="relative bg-[#0A1128] text-white overflow-hidden" id="contatti">

        {/* Watermark wordmark */}
        <div className="absolute inset-0 flex items-end pointer-events-none overflow-hidden" aria-hidden="true">
          <span className="font-serif italic text-[22vw] text-white opacity-[0.03] select-none leading-none whitespace-nowrap -mb-4 -ml-2 tracking-tight">
            il veliero
          </span>
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 pt-28 pb-14">

          {/* Top: brand + tagline + location */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-8 mb-20 border-b border-white/[0.07] pb-16">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/70">
                  <path d="M12 2L20 14H4L12 2Z" fill="currentColor" fillOpacity="0.12" />
                  <path d="M12 22V14" />
                </svg>
                <span className="font-serif italic text-2xl tracking-wide text-white/85">il veliero</span>
                <span className="text-[#D4AF37] text-xs tracking-wider">★★★</span>
              </div>
              <p className="text-white/35 font-light text-sm max-w-xs leading-relaxed">
                Un rifugio siciliano a conduzione familiare.<br/>Il mare è a un respiro. Il tempo si ferma.
              </p>
            </div>
            <div className="text-left md:text-right">
              <p className="font-serif italic text-[#D4AF37]/50 text-lg mb-1">San Vito Lo Capo</p>
              <p className="text-white/25 text-[10px] uppercase tracking-widest font-sans">Sicilia · Italia</p>
            </div>
          </div>

          {/* Middle: three info columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 mb-20">

            <div>
              <p className="text-[#D4AF37] text-[9px] uppercase tracking-[0.3em] font-sans mb-5">Posizione</p>
              <address className="not-italic text-white/40 text-sm font-light leading-loose">
                Via Savoia 15<br/>
                91010 San Vito Lo Capo (TP)<br/>
                Sicilia, Italia
              </address>
            </div>

            <div>
              <p className="text-[#D4AF37] text-[9px] uppercase tracking-[0.3em] font-sans mb-5">Contatti</p>
              <ul className="space-y-3">
                <li>
                  <a href="tel:+390923000000" className="text-white/40 text-sm font-light hover:text-[#5BB8E8] transition-colors duration-300" data-testid="link-phone">
                    +39 0923 000000
                  </a>
                </li>
                <li>
                  <a href="mailto:info@ilveliero.it" className="text-white/40 text-sm font-light hover:text-[#5BB8E8] transition-colors duration-300" data-testid="link-email">
                    info@ilveliero.it
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/40 text-sm font-light hover:text-[#5BB8E8] transition-colors duration-300" data-testid="link-instagram">
                    @ilveliero.sicilia
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-[#D4AF37] text-[9px] uppercase tracking-[0.3em] font-sans mb-5">Prenotazioni</p>
              <p className="text-white/35 text-sm font-light leading-relaxed mb-6">
                Check-in 15:00 · Check-out 11:00<br/>
                Aperto tutto l'anno.
              </p>
              <button
                className="border border-[#D4AF37]/30 text-[#D4AF37]/70 px-8 py-3 text-[9px] uppercase tracking-[0.2em] hover:bg-[#D4AF37] hover:text-[#0A1128] transition-all duration-500"
                data-testid="btn-prenota-footer"
              >
                Prenota Ora
              </button>
            </div>

          </div>

          {/* Bottom strip */}
          <div className="border-t border-white/[0.06] pt-7 flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-white/20 text-[10px] font-light tracking-wide">
              &copy; {new Date().getFullYear()} Il Veliero — San Vito Lo Capo. Tutti i diritti riservati.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-white/20 text-[10px] hover:text-white/40 transition-colors" data-testid="link-privacy">Privacy</a>
              <a href="#" className="text-white/20 text-[10px] hover:text-white/40 transition-colors" data-testid="link-terms">Cookie</a>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
