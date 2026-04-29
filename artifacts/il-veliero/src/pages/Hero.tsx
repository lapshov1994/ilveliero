import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import MenuTrigger from '@/components/MenuTrigger';
import { useNav } from '@/components/NavigationContext';
import shipLogoUrl from '@assets/sailing-ship-silhouette-000000-xl_1777459411002.png';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
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
  const marqueeTweenRef = useRef<gsap.core.Tween | null>(null);
  const sailboatSwayTweenRef = useRef<gsap.core.Tween | null>(null);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const { isOpen } = useNav();

  useEffect(() => {
    // Header darkens once the hero section has been scrolled almost out
    // of view. Computed from the section's actual bounding rect rather
    // than a fixed percentage of the viewport, so the trigger is correct
    // for both the short mobile aspect-[4/5] hero AND the full-screen
    // desktop hero.
    const onScroll = () => {
      const heroEl = document.querySelector('.hero-section') as HTMLElement | null;
      const heroBottom = heroEl
        ? heroEl.getBoundingClientRect().bottom
        : window.innerHeight * 0.4;
      setHeaderScrolled(heroBottom < 80);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
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
    );

    // The booking widget is intentionally NOT animated in — it must
    // be visible the instant the page loads so users can start a
    // search without waiting for the hero intro to finish.

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
      sailboatSwayTweenRef.current = gsap.to(sailboatSwayRef.current, {
        rotation: 3,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
        transformOrigin: 'center bottom',
      });
    }

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
        marqueeTweenRef.current = gsap.to(inner, {
          xPercent: -50,
          ease: 'none',
          duration: 35,
          repeat: -1,
        });
      }
    }

    });

    return () => {
      ctx.revert();
      marqueeTweenRef.current = null;
      sailboatSwayTweenRef.current = null;
    };
  }, []);

  useEffect(() => {
    const tweens = [marqueeTweenRef.current, sailboatSwayTweenRef.current];
    tweens.forEach((t) => {
      if (!t) return;
      if (isOpen) t.pause();
      else t.resume();
    });
  }, [isOpen]);

  return (
    <>
      {/* Scroll progress bar — fixed at very top */}
      <div
        ref={scrollProgressRef}
        className="fixed top-0 left-0 h-0.5 bg-[#D4AF37] w-full origin-left scale-x-0 z-[165]"
      />

      {/* Header — fixed so the sailboat stays in viewport while it sails away.
          Adds a glassmorphic backdrop once the user scrolls past the hero so
          the white text stays readable on light sections below. */}
      <header
        className={`fixed top-0 left-0 w-full px-5 md:px-8 py-4 md:py-6 z-[150] flex justify-between items-center text-white transition-all duration-500 ${
          headerScrolled ? 'bg-[#0A1128]/75 backdrop-blur-md' : ''
        }`}
      >
        <div className="flex items-center gap-3 md:gap-4 group cursor-pointer relative z-50">
          <div className="relative">
            <div
              ref={sailboatRef}
              className="relative z-50 transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-110"
            >
              <div ref={sailboatSwayRef}>
                <div
                  className="w-8 h-8 md:w-10 md:h-10 drop-shadow-xl"
                  style={{
                    backgroundColor: 'white',
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
            </div>
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-[1px] bg-[#D4AF37] scale-x-0 group-hover:scale-x-150 group-hover:opacity-40 transition-all duration-700 origin-center" />
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-3 h-[1px] bg-[#D4AF37] scale-x-0 group-hover:scale-x-125 group-hover:opacity-30 transition-all duration-700 delay-150 origin-center" />
          </div>
          <div className="flex flex-col flex-shrink-0">
            <span className="text-base md:text-xl tracking-[0.3em] font-serif uppercase text-white leading-none">
              il veliero
            </span>
            <span className="text-[9px] md:text-[10px] tracking-[0.4em] text-[#D4AF37] uppercase mt-1 md:mt-1.5 opacity-80 font-light">
              Tradizione &amp; Vento
            </span>
          </div>
        </div>
        <MenuTrigger className="text-white hover:text-[#D4AF37] transition-colors" />
      </header>

      {/* Hero + booking-widget wrapper. The wrapper is `relative` so the
          booking widget can position absolutely OVER the hero on desktop
          (md:absolute md:bottom-8) while sitting in normal flow directly
          BELOW the video on mobile. The wrapper carries the navy
          background ONLY on mobile so the booking widget reads cleanly
          against it without a stripe of white body bg showing through. */}
      <div className="relative bg-[#0A1128] md:bg-transparent">
        {/* Hero section. Mobile: portrait aspect-[4/5] container (the
            16:9 source is cropped to portrait, focus held slightly left
            of centre so the breakfast table stays in frame). Desktop:
            full-screen, original full-cover crop. */}
        <section className="hero-section relative z-10 w-full overflow-hidden bg-[#0A1128] aspect-[4/5] md:aspect-auto md:h-screen">
          <div
            ref={heroBgRef}
            className="absolute inset-0 w-full h-full overflow-hidden"
          >
            <video
              className="absolute inset-0 w-full h-full object-cover object-[8%_50%] md:object-[22%_50%]"
              src={`${import.meta.env.BASE_URL}video/hero.mp4`}
              poster={`${import.meta.env.BASE_URL}video/hero-poster.jpg`}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-hidden="true"
              data-testid="hero-video"
              onCanPlay={(e) => {
                // Some headless / strict autoplay policies (especially
                // on first visit) won't honour the `autoPlay` attribute.
                // We force-trigger play once the browser confirms it
                // can play — safe because the video is muted, which
                // all browsers allow without a user gesture.
                const v = e.currentTarget;
                v.muted = true;
                const p = v.play();
                if (p && typeof p.catch === 'function') p.catch(() => undefined);
              }}
            />
            {/* Top vignette — slightly stronger on mobile so the white
                logo + Tradizione tagline sit cleanly on top of bright
                daylight frames. */}
            <div className="absolute inset-x-0 top-0 h-32 md:h-48 bg-gradient-to-b from-[#0A1128]/65 md:from-[#0A1128]/55 to-transparent pointer-events-none" />
            {/* Bottom vignette — softer on mobile because the navy area
                below the video already meets it cleanly. */}
            <div className="absolute inset-x-0 bottom-0 h-20 md:h-64 bg-gradient-to-t from-[#0A1128]/45 md:from-[#0A1128]/65 to-transparent pointer-events-none" />
          </div>

          {/* Title overlay. Two stacked lines on every breakpoint —
              line 1 ("Dove il Mare") above line 2 ("Incontra il Cielo"
              in italic). Mobile sits a touch higher (top-[22%]) so the
              breakfast table in the video stays visible below; desktop
              centres the block within the full-screen hero. */}
          <div className="absolute inset-x-0 top-[20%] md:top-0 md:bottom-0 z-10 flex flex-col items-center justify-start md:justify-center md:-mt-10 text-center px-4">
            <div className="overflow-hidden mb-1 md:mb-2">
              <h1
                ref={heroLine1Ref}
                className="text-4xl md:text-7xl font-serif text-white font-light tracking-tight drop-shadow-md whitespace-nowrap"
                style={{ transform: 'translateY(100%)' }}
              >
                Dove il Mare
              </h1>
            </div>
            <div className="overflow-hidden mb-2 md:mb-12">
              <h1
                ref={heroLine2Ref}
                className="text-4xl md:text-7xl font-serif italic text-white font-light tracking-tight drop-shadow-md whitespace-nowrap"
                style={{ transform: 'translateY(100%)' }}
              >
                Incontra il Cielo
              </h1>
            </div>
          </div>
        </section>

        {/* Booking widget. Mobile: relative positioning, sits flush
            below the video with a small navy gutter on either side.
            Desktop: absolute, overlays the hero bottom exactly as
            before. A single element / single ref / single
            data-testid is preserved so SandFilter and the GSAP intro
            both keep working. */}
        {/* Booking widget — coloured to match the marquee band beneath it.
            Body uses the same sky-blue (#5BB8E8) as the running text in the
            marquee, with deep-navy (#0A1128) typography on top so the labels
            and dates stay highly legible. The "Prenota Ora" CTA inverts to
            navy with sky-blue text, then sweeps to a brighter aqua on hover.
            This replaces the previous black/30-glass + gold button look the
            user explicitly asked us to drop. */}
        <div
          ref={heroBookingRef}
          className="relative z-20 w-full md:w-[95%] max-w-none md:max-w-5xl md:mx-auto bg-[#5BB8E8] border-y md:border border-[#5BB8E8] flex flex-col md:flex-row justify-between items-stretch shadow-2xl md:absolute md:bottom-8 md:left-1/2 md:-translate-x-1/2"
        >
          <div className="flex-1 flex flex-col md:flex-row md:justify-around w-full px-5 md:px-6 py-4 text-[#0A1128] text-sm gap-3 md:gap-0 md:items-center">
            <div className="flex md:flex-col items-baseline md:items-start justify-between md:justify-start cursor-pointer group" data-testid="widget-checkin">
              <span className="text-[10px] text-[#0A1128]/65 uppercase tracking-[0.15em] md:mb-1 group-hover:text-[#0A1128] transition-colors">Arrivo</span>
              <span className="font-light tracking-wide">28.04.2026</span>
            </div>
            <div className="hidden md:block w-px h-8 bg-[#0A1128]/15 mx-2" />
            <div className="block md:hidden h-px w-full bg-[#0A1128]/15" />
            <div className="flex md:flex-col items-baseline md:items-start justify-between md:justify-start cursor-pointer group" data-testid="widget-checkout">
              <span className="text-[10px] text-[#0A1128]/65 uppercase tracking-[0.15em] md:mb-1 group-hover:text-[#0A1128] transition-colors">Partenza</span>
              <span className="font-light tracking-wide">30.04.2026</span>
            </div>
            <div className="hidden md:block w-px h-8 bg-[#0A1128]/15 mx-2" />
            <div className="block md:hidden h-px w-full bg-[#0A1128]/15" />
            <div className="flex md:flex-col items-baseline md:items-start justify-between md:justify-start cursor-pointer group" data-testid="widget-guests">
              <span className="text-[10px] text-[#0A1128]/65 uppercase tracking-[0.15em] md:mb-1 group-hover:text-[#0A1128] transition-colors">Ospiti</span>
              <span className="font-light tracking-wide">2 Adulti</span>
            </div>
          </div>
          <button
            className="bg-[#0A1128] text-[#5BB8E8] px-6 md:px-10 py-4 uppercase text-[11px] tracking-[0.2em] font-medium transition-all duration-500 w-full md:w-auto hover:shadow-xl relative overflow-hidden group"
            data-testid="btn-prenota"
          >
            <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[#0A1128]">Prenota Ora</span>
            <span className="absolute inset-0 bg-white scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
          </button>
        </div>
      </div>

      {/* Marquee band */}
      <section className="relative z-10 bg-[#0A1128] overflow-hidden py-4 border-y border-white/5">
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
