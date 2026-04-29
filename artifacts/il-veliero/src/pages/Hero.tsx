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
    const onScroll = () => {
      setHeaderScrolled(window.scrollY > window.innerHeight * 0.6);
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
        className={`fixed top-0 left-0 w-full px-8 py-6 z-[150] flex justify-between items-center text-white transition-all duration-500 ${
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
                <div
                  className="w-10 h-10 drop-shadow-xl"
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
            <span className="text-xl tracking-[0.3em] font-serif uppercase text-white leading-none">
              il veliero
            </span>
            <span className="text-[10px] tracking-[0.4em] text-[#D4AF37] uppercase mt-1.5 opacity-80 font-light">
              Tradizione &amp; Vento
            </span>
          </div>
        </div>
        <MenuTrigger className="text-white hover:text-[#D4AF37] transition-colors" />
      </header>

      {/* Full-screen hero */}
      <section className="hero-section relative z-10 w-full h-screen overflow-hidden bg-[#0A1128]">
        <div
          ref={heroBgRef}
          className="absolute inset-0 w-full h-full overflow-hidden"
        >
          {/* The poster image is bundled and loads instantly so the hero is
              never blank while the video bytes stream in. The video itself
              is 1.6 MB H.264 with `+faststart` so playback can begin from
              the first downloaded chunks.

              Mobile (< md): the 16:9 video is shown LETTERBOXED — full
              width, native 16:9 aspect, centred vertically on the navy
              hero background. This keeps every pixel at native resolution
              instead of upscaling 3× to fill a portrait viewport (which
              was making the footage look soft / low-quality). Title and
              booking widget are absolutely positioned over the same
              navy/letterbox stack and adapt automatically.

              Desktop (md+): the video keeps full-cover behaviour and is
              gently re-centred horizontally so the breakfast table and
              door land in frame instead of the empty wall on the right. */}
          <video
            className="absolute left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-1/2 aspect-video object-cover md:left-0 md:top-0 md:translate-x-0 md:translate-y-0 md:w-full md:h-full md:aspect-auto md:object-[22%_50%]"
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
              // Some headless / strict autoplay policies (especially on
              // first visit) won't honour the `autoPlay` attribute. We
              // force-trigger play once the browser confirms it can play
              // — this is safe because the video is muted, which all
              // browsers allow without a user gesture.
              const v = e.currentTarget;
              v.muted = true;
              const p = v.play();
              if (p && typeof p.catch === 'function') p.catch(() => undefined);
            }}
          />
          {/* Soft top + bottom vignettes for legibility of the logo and
              the booking widget — much subtler than the old bg-black/40
              the user removed, just enough to keep white type readable
              against bright daylight frames. */}
          <div className="absolute inset-x-0 top-0 h-40 md:h-48 bg-gradient-to-b from-[#0A1128]/55 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-56 md:h-64 bg-gradient-to-t from-[#0A1128]/65 to-transparent pointer-events-none" />
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

        {/* Booking widget — stacks fully on mobile, inline bar on desktop */}
        <div
          ref={heroBookingRef}
          className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-20 w-[92%] md:w-[95%] max-w-5xl bg-black/30 backdrop-blur-md border border-white/10 flex flex-col md:flex-row justify-between items-stretch shadow-2xl opacity-0"
        >
          <div className="flex-1 flex flex-col md:flex-row md:justify-around w-full px-5 md:px-6 py-4 text-white text-sm gap-3 md:gap-0 md:items-center">
            <div className="flex md:flex-col items-baseline md:items-start justify-between md:justify-start cursor-pointer group" data-testid="widget-checkin">
              <span className="text-[10px] text-white/50 uppercase tracking-[0.15em] md:mb-1 group-hover:text-white transition-colors">Arrivo</span>
              <span className="font-light tracking-wide">28.04.2026</span>
            </div>
            <div className="hidden md:block w-px h-8 bg-white/10 mx-2" />
            <div className="block md:hidden h-px w-full bg-white/10" />
            <div className="flex md:flex-col items-baseline md:items-start justify-between md:justify-start cursor-pointer group" data-testid="widget-checkout">
              <span className="text-[10px] text-white/50 uppercase tracking-[0.15em] md:mb-1 group-hover:text-white transition-colors">Partenza</span>
              <span className="font-light tracking-wide">30.04.2026</span>
            </div>
            <div className="hidden md:block w-px h-8 bg-white/10 mx-2" />
            <div className="block md:hidden h-px w-full bg-white/10" />
            <div className="flex md:flex-col items-baseline md:items-start justify-between md:justify-start cursor-pointer group" data-testid="widget-guests">
              <span className="text-[10px] text-white/50 uppercase tracking-[0.15em] md:mb-1 group-hover:text-white transition-colors">Ospiti</span>
              <span className="font-light tracking-wide">2 Adulti</span>
            </div>
          </div>
          <button
            className="bg-[#D4AF37] text-black px-6 md:px-10 py-4 uppercase text-[11px] tracking-[0.2em] font-medium transition-all duration-500 w-full md:w-auto hover:shadow-xl relative overflow-hidden group"
            data-testid="btn-prenota"
          >
            <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[#0A1128]">Prenota Ora</span>
            <span className="absolute inset-0 bg-white scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
          </button>
        </div>
      </section>

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
