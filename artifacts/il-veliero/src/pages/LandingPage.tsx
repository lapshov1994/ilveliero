import React, { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MapPin, Sparkles, Sun, Heart, ChevronDown, Play, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const heroBgRef = useRef<HTMLDivElement>(null);
  const heroSubtitleRef = useRef<HTMLParagraphElement>(null);
  const heroBookingRef = useRef<HTMLDivElement>(null);
  const heroLine1Ref = useRef<HTMLDivElement>(null);
  const heroLine2Ref = useRef<HTMLDivElement>(null);
  const heading1Ref = useRef<HTMLDivElement>(null);
  const heading2Ref = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const pillarsRef = useRef<HTMLDivElement>(null);
  const vibeVideoRef = useRef<HTMLDivElement>(null);

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

    // Scroll listener for header
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);

    // GSAP Intro Timeline (cinematic entrance on load)
    const introTl = gsap.timeline({ defaults: { ease: "power3.out" } });
    if (heroBgRef.current) {
      introTl.fromTo(
        heroBgRef.current,
        { scale: 1.15 },
        { scale: 1, duration: 2.5, ease: "power2.out" }
      );
    }
    if (heroLine1Ref.current && heroLine2Ref.current) {
      introTl.fromTo(
        [heroLine1Ref.current, heroLine2Ref.current],
        { y: 100 },
        { y: 0, duration: 1.2, stagger: 0.15 },
        "-=1.5"
      );
    }
    if (heroSubtitleRef.current) {
      introTl.fromTo(
        heroSubtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1 },
        "-=1"
      );
    }
    if (heroBookingRef.current) {
      introTl.fromTo(
        heroBookingRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1 },
        "-=0.8"
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

    // 4. Pillars Stagger
    if (pillarsRef.current) {
      const cards = pillarsRef.current.querySelectorAll(".pillar-card");
      gsap.fromTo(
        cards,
        { scale: 0.95, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: pillarsRef.current,
            start: "top 80%",
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
      window.removeEventListener("scroll", handleScroll);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-secondary/30 selection:text-foreground overflow-x-hidden">
      {/* 1. Header/Nav */}
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? "bg-white shadow-sm py-4" : "bg-transparent py-6"
        }`}
      >
        <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Sailboat SVG Logo */}
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={isScrolled ? "text-primary" : "text-white"}
            >
              <path d="M16 8L24 22H8L16 8Z" fill="currentColor" />
              <path d="M16 26C11.5817 26 8 22.4183 8 18H24C24 22.4183 20.4183 26 16 26Z" fill="currentColor" />
              <circle cx="16" cy="4" r="1" fill="currentColor" />
              <circle cx="11" cy="6" r="1" fill="currentColor" />
              <circle cx="21" cy="6" r="1" fill="currentColor" />
            </svg>
            <span
              className={`font-serif italic text-xl md:text-2xl font-semibold tracking-wide transition-colors ${
                isScrolled ? "text-primary" : "text-white"
              }`}
            >
              il veliero
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {["Camere", "Giardino", "Posizione"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className={`text-sm tracking-widest uppercase transition-colors hover:opacity-70 ${
                  isScrolled ? "text-primary" : "text-white"
                }`}
                data-testid={`link-${item.toLowerCase()}`}
              >
                {item}
              </a>
            ))}
            <Button
              variant="outline"
              className={`rounded-none uppercase tracking-widest text-xs px-6 py-5 transition-colors ${
                isScrolled
                  ? "border-primary text-primary hover:bg-primary hover:text-white"
                  : "border-white text-white hover:bg-white hover:text-primary"
              }`}
              data-testid="btn-prenota-header"
            >
              Prenota
            </Button>
          </nav>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="hero-section relative h-screen w-full overflow-hidden bg-[#0A1128]">
        {/* Parallax Background — Real Photo */}
        <div
          ref={heroBgRef}
          className="absolute top-0 left-0 w-full h-[120%] -top-[10%] bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=2000&auto=format&fit=crop')",
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
          <p
            ref={heroSubtitleRef}
            className="text-secondary uppercase tracking-[0.3em] text-xs md:text-sm font-medium mb-8 opacity-0"
          >
            San Vito Lo Capo, Sicilia
          </p>

          <div ref={heading1Ref} className="font-serif text-white text-5xl md:text-7xl lg:text-8xl leading-tight mb-4">
            <div className="overflow-hidden">
              <div ref={heroLine1Ref} className="reveal-line" style={{ transform: "translateY(100%)" }}>
                Dove il Mare
              </div>
            </div>
            <div className="overflow-hidden">
              <div ref={heroLine2Ref} className="reveal-line italic text-secondary/90" style={{ transform: "translateY(100%)" }}>
                Incontra il Cielo
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-44 left-1/2 -translate-x-1/2 animate-bounce text-white/50">
            <ChevronDown size={24} strokeWidth={1} />
          </div>
        </div>

        {/* Glassmorphism Booking Widget — inside hero at bottom */}
        <div
          ref={heroBookingRef}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 w-11/12 max-w-4xl opacity-0"
        >
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-2 flex flex-col md:flex-row justify-between items-center">
            <div className="flex-1 flex justify-around w-full px-4 py-2 text-white text-sm">
              <div className="flex flex-col cursor-pointer hover:text-secondary transition-colors">
                <span className="text-[10px] text-white/60 uppercase tracking-widest mb-1">Arrivo</span>
                <input
                  type="date"
                  className="bg-transparent border-none outline-none text-white text-sm cursor-pointer w-32"
                  data-testid="input-checkin"
                />
              </div>
              <div className="w-px bg-white/20 mx-4 self-stretch" />
              <div className="flex flex-col cursor-pointer hover:text-secondary transition-colors">
                <span className="text-[10px] text-white/60 uppercase tracking-widest mb-1">Partenza</span>
                <input
                  type="date"
                  className="bg-transparent border-none outline-none text-white text-sm cursor-pointer w-32"
                  data-testid="input-checkout"
                />
              </div>
              <div className="w-px bg-white/20 mx-4 self-stretch" />
              <div className="flex flex-col cursor-pointer hover:text-secondary transition-colors">
                <span className="text-[10px] text-white/60 uppercase tracking-widest mb-1">Ospiti</span>
                <select
                  className="bg-transparent border-none outline-none text-white text-sm cursor-pointer appearance-none"
                  data-testid="select-guests"
                >
                  <option value="1" className="text-primary bg-white">1 Ospite</option>
                  <option value="2" className="text-primary bg-white">2 Adulti</option>
                  <option value="3" className="text-primary bg-white">3 Ospiti</option>
                  <option value="4" className="text-primary bg-white">4 Ospiti</option>
                </select>
              </div>
            </div>

            <button
              className="bg-accent text-primary px-8 py-4 uppercase text-xs tracking-widest font-bold hover:bg-white transition-colors duration-300 w-full md:w-auto mt-4 md:mt-0"
              data-testid="btn-verify-availability"
            >
              Prenota Ora
            </button>
          </div>
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

      {/* 4. 4 Pillars Section */}
      <section className="py-32 px-6 md:px-12 bg-[#FAFAF8]" id="posizione">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20 section-title-reveal">
            <h2 className="font-serif text-4xl md:text-5xl text-primary mb-4">La Nostra Promessa</h2>
            <div className="w-12 h-px bg-secondary mx-auto"></div>
          </div>

          <div ref={pillarsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: MapPin, title: "Posizione Centrale", desc: "Nel cuore vivo del paese." },
              { icon: Sun, title: "3 Minuti dalla Spiaggia", desc: "La sabbia bianca a pochi passi." },
              { icon: Sparkles, title: "Pulizia Impeccabile", desc: "Cura maniacale di ogni dettaglio." },
              { icon: Heart, title: "Ospitalità Siciliana", desc: "Sentirsi a casa, lontano da casa." },
            ].map((pillar, idx) => (
              <div
                key={idx}
                className="pillar-card bg-white p-8 border border-border/50 text-center flex flex-col items-center hover:shadow-sm transition-shadow duration-500"
                data-testid={`card-pillar-${idx}`}
              >
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-6">
                  <pillar.icon className="text-secondary" size={24} strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-xl text-primary mb-3">{pillar.title}</h3>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">{pillar.desc}</p>
              </div>
            ))}
          </div>
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
