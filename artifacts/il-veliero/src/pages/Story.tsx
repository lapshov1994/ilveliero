import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import shellsImg from '@assets/shells.jpg';
import welcomeImg from '@assets/welcome_aboard.jpg';

gsap.registerPlugin(ScrollTrigger);

export default function Story() {
  const containerRef = useRef<HTMLElement>(null);
  const image1Ref = useRef<HTMLImageElement>(null);
  const image2Ref = useRef<HTMLImageElement>(null);
  const image1WrapRef = useRef<HTMLDivElement>(null);
  const image2WrapRef = useRef<HTMLDivElement>(null);
  const text1Ref = useRef<HTMLDivElement>(null);
  const text2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.to(image1Ref.current, {
      y: 100,
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });

    gsap.to(image2Ref.current, {
      y: -100,
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });

    [text1Ref.current, text2Ref.current].forEach((text) => {
      if (!text) return;
      gsap.fromTo(
        text,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.5,
          ease: "power3.out",
          scrollTrigger: {
            trigger: text,
            start: "top 85%",
          },
        }
      );
    });

    // Image reveal — staggered fade-in + upward translate.
    // Targets the WRAPPER divs so it doesn't collide with the parallax y
    // tween already running on the inner <img> elements.
    [image1WrapRef.current, image2WrapRef.current].forEach((wrap, idx) => {
      if (!wrap) return;
      gsap.fromTo(
        wrap,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1.4,
          ease: "power3.out",
          delay: idx * 0.15,
          scrollTrigger: {
            trigger: wrap,
            start: "top 85%",
          },
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="majolica-bg relative z-10 bg-white text-[#0A1128] py-12 md:py-20 px-6 lg:px-20 overflow-hidden"
    >
      {/* Background watermark number */}
      <div className="absolute top-10 left-10 text-[20rem] font-serif text-black opacity-[0.02] select-none pointer-events-none leading-none">
        01
      </div>

      <div className="max-w-7xl mx-auto relative">

        {/* Section heading */}
        <div className="mb-14 md:mb-24">
          <h2 className="text-sm tracking-[0.3em] text-[#D4AF37] uppercase mb-6">72 Ore Perfette</h2>
          <p className="text-4xl md:text-6xl font-serif max-w-2xl leading-tight">
            Il tempo rallenta. <br/>
            <span className="italic text-gray-400">Le giornate si misurano in onde.</span>
          </p>
        </div>

        {/* Asymmetric editorial grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-0 relative">

          {/* Left block — Garden & Breakfast (7 cols) */}
          <div className="md:col-span-7 relative z-10">
            <div ref={image1WrapRef} className="overflow-hidden aspect-[4/3] w-full bg-gray-100">
              <img
                ref={image1Ref}
                src={shellsImg}
                alt="Conchiglie, stelle marine e coralli — dettagli marinari de Il Veliero"
                className="w-full h-[120%] object-cover scale-110"
              />
            </div>

            {/* Text overlaps photo from below */}
            <div
              ref={text1Ref}
              className="relative md:absolute md:-bottom-16 md:-right-24 bg-white p-8 md:p-12 shadow-2xl w-[90%] md:w-[80%] ml-auto -mt-10 md:mt-0"
            >
              <h3 className="text-3xl font-serif mb-4">Un risveglio profumato</h3>
              <p className="text-sm leading-relaxed text-gray-600">
                Immagina di svegliarti con il profumo del gelsomino che entra dalla finestra.
                Scendi in giardino, dove un caffè caldo e dolci appena sfornati ti aspettano all'ombra degli ulivi.
              </p>
            </div>
          </div>

          {/* Right block — Sea & Cleanliness (4 cols, shifted down) */}
          <div className="md:col-span-4 md:col-start-9 mt-14 md:mt-32 relative z-20">
            <div ref={image2WrapRef} className="overflow-hidden aspect-[3/4] w-full bg-gray-100 mb-8">
              <img
                ref={image2Ref}
                src={welcomeImg}
                alt="Salvagente Welcome Aboard e poltroncina con cuscino veliero"
                className="w-full h-[120%] object-cover scale-110"
              />
            </div>

            <div ref={text2Ref} className="px-4 md:px-0">
              <span className="text-xs tracking-[0.2em] text-[#D4AF37] uppercase font-bold block mb-3">
                Tre minuti esatti
              </span>
              <h3 className="text-2xl font-serif mb-4">A due passi dall'acqua</h3>
              <p className="text-sm leading-relaxed text-gray-600 mb-6">
                Nessuna fretta. Lasci l'hotel e senti già la sabbia sotto i piedi. E quando torni,
                trovi spazi immacolati. La pulizia non è un dettaglio, è la nostra ossessione per garantirti un rifugio sicuro.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
