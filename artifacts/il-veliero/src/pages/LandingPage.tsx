import React, { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Play, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

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

    // 5. Media Scale-in
    if (vibeVideoRef.current) {
      const mediaInner = vibeVideoRef.current.querySelector(".media-inner");
      gsap.fromTo(
        mediaInner,
        { scale: 1.1 },
        {
          scale: 1,
          duration: 1.5,
          ease: "power3.out",
          scrollTrigger: {
            trigger: vibeVideoRef.current,
            start: "top 85%",
          },
        }
      );
    }

    // Other section headers reveal
    document.querySelectorAll(".section-title-reveal").forEach((el) => {
      gsap.fromTo(
        el,
        { y: 50, opacity: 0 },
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

      {/* 5. The Vibe / Garden Section */}
      <section className="py-32 px-6 md:px-12 bg-white" id="giardino">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Left: Video Placeholder */}
            <div
              ref={vibeVideoRef}
              className="relative w-full aspect-video overflow-hidden group cursor-pointer"
              data-testid="video-vibe"
            >
              <div className="media-inner w-full h-full bg-gradient-to-br from-primary via-[#112a52] to-secondary relative">
                <div className="absolute inset-0 bg-primary/20 group-hover:bg-primary/10 transition-colors duration-500" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <div className="w-16 h-16 rounded-full border border-white/30 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-500">
                    <Play size={20} fill="currentColor" className="ml-1 text-white/90" />
                  </div>
                  <span className="mt-4 text-xs tracking-[0.2em] uppercase font-light text-white/80">
                    Il Nostro Giardino
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Text Content */}
            <div className="max-w-xl">
              <div ref={heading2Ref} className="mb-8">
                <div className="overflow-hidden">
                  <h2 className="reveal-line font-serif text-4xl md:text-5xl lg:text-6xl text-primary leading-tight">
                    72 Ore Perfette
                  </h2>
                </div>
              </div>
              <div className="space-y-6 text-muted-foreground font-light leading-relaxed text-lg section-title-reveal">
                <p>
                  Immagina di svegliarti con il profumo del gelsomino che entra dalla finestra. Scendi in giardino, dove un
                  caffè caldo e dolci appena sfornati ti aspettano all'ombra degli ulivi.
                </p>
                <p>
                  Nessuna fretta. Il mare è a soli tre minuti a piedi, e le sue sfumature azzurre ti chiamano. Qui, il
                  tempo rallenta. Le giornate sono scandite dal suono delle onde, dalla luce calda del tramonto e da
                  sorrisi sinceri.
                </p>
              </div>
              <div className="mt-12 section-title-reveal">
                <Button
                  variant="outline"
                  className="rounded-none border-primary text-primary hover:bg-primary hover:text-white uppercase tracking-widest text-xs px-8 py-6"
                  data-testid="btn-scopri-giardino"
                >
                  Scopri di Più
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Social Proof / Trust Section */}
      <section className="py-32 px-6 md:px-12 bg-[#FAFAF8]">
        <div className="container mx-auto max-w-6xl">
          {/* Host Quote */}
          <div className="max-w-4xl mx-auto text-center mb-24 section-title-reveal">
            <p className="font-serif text-3xl md:text-4xl text-primary leading-relaxed italic mb-8">
              "Ogni ospite è trattato come un membro della famiglia. San Vito è il nostro tesoro, e siamo felici di
              condividerlo con voi."
            </p>
            <p className="uppercase tracking-[0.2em] text-xs text-muted-foreground">— La Famiglia Valenti</p>
          </div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sofía M., Madrid",
                quote:
                  "Ci siamo sentiti come a casa. La famiglia è calorosa e la posizione perfetta — 3 minuti a piedi e sei sulla spiaggia più bella della Sicilia.",
              },
              {
                name: "Thomas B., Berlin",
                quote:
                  "Pulizia, silenzio, ospitalità autentica. La colazione in giardino è stata indimenticabile.",
              },
              {
                name: "Claire L., Lyon",
                quote:
                  "Un angolo di pace raro. Mi sono sentita completamente al sicuro e coccolata per tutta la settimana.",
              },
            ].map((review, idx) => (
              <div
                key={idx}
                className="bg-white p-8 md:p-10 border border-border/40 section-title-reveal flex flex-col h-full"
                data-testid={`review-card-${idx}`}
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="text-accent fill-accent" />
                  ))}
                </div>
                <p className="font-serif text-lg text-primary mb-8 flex-grow leading-relaxed">"{review.quote}"</p>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{review.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="bg-primary text-white pt-24 pb-12 px-6 md:px-12">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            {/* Brand Column */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                  <path d="M16 8L24 22H8L16 8Z" fill="currentColor" />
                  <path d="M16 26C11.5817 26 8 22.4183 8 18H24C24 22.4183 20.4183 26 16 26Z" fill="currentColor" />
                  <circle cx="16" cy="4" r="1" fill="currentColor" />
                  <circle cx="11" cy="6" r="1" fill="currentColor" />
                  <circle cx="21" cy="6" r="1" fill="currentColor" />
                </svg>
                <span className="font-serif italic text-3xl font-semibold tracking-wide">il veliero</span>
              </div>
              <p className="text-white/60 font-light max-w-xs text-sm leading-relaxed">
                Un rifugio siciliano a conduzione familiare dove il mare è a un respiro e il tempo si ferma.
              </p>
            </div>

            {/* Address Column */}
            <div>
              <h4 className="uppercase tracking-[0.2em] text-xs font-medium mb-6 text-secondary">Posizione</h4>
              <address className="not-italic text-white/70 text-sm font-light leading-loose">
                Via Savoia 15<br />
                91010 San Vito Lo Capo (TP)<br />
                Sicilia, Italia
              </address>
            </div>

            {/* Contact Column */}
            <div>
              <h4 className="uppercase tracking-[0.2em] text-xs font-medium mb-6 text-secondary">Contatti</h4>
              <ul className="text-white/70 text-sm font-light space-y-4">
                <li>
                  <a href="tel:+390923000000" className="hover:text-secondary transition-colors" data-testid="link-phone">
                    +39 0923 000000
                  </a>
                </li>
                <li>
                  <a href="mailto:info@ilveliero.it" className="hover:text-secondary transition-colors" data-testid="link-email">
                    info@ilveliero.it
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-secondary transition-colors" data-testid="link-instagram">
                    Instagram
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/40 font-light">
            <p>&copy; {new Date().getFullYear()} Il Veliero San Vito Lo Capo. Tutti i diritti riservati.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors" data-testid="link-privacy">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors" data-testid="link-terms">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
