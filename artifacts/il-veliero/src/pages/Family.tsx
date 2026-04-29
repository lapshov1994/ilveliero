import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Family() {
  const containerRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<(HTMLElement | null)[]>([]);

  const addToRefs = (el: HTMLElement | null) => {
    if (el && !elementsRef.current.includes(el)) {
      elementsRef.current.push(el);
    }
  };

  useEffect(() => {
    // Scope all tweens/triggers so they're cleanly torn down on unmount,
    // preventing duplicate animations on route revisits.
    const ctx = gsap.context(() => {
      gsap.fromTo(imageRef.current,
        { scale: 1.1 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );

      // Image reveal — fade-in + upward translate.
      // Targets the WRAPPER div so it doesn't collide with the parallax scale
      // tween already running on the inner <img>.
      gsap.fromTo(imageWrapRef.current,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1.4,
          ease: "power3.out",
          scrollTrigger: {
            trigger: imageWrapRef.current,
            start: "top 85%",
          },
        }
      );

      elementsRef.current.forEach((el) => {
        gsap.fromTo(el,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={containerRef} className="relative z-10 bg-[#F9F9F9] text-[#0A1128] py-20 md:py-28 px-6 lg:px-20 overflow-hidden">

      {/* Watermark */}
      <div className="absolute top-20 right-10 text-[20rem] font-serif text-black opacity-[0.02] select-none pointer-events-none leading-none">
        03
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8 relative z-10 items-center">

        {/* Left column: Text + Review (5 cols) */}
        <div className="md:col-span-5 flex flex-col justify-center">
          <div ref={addToRefs}>
            <span className="text-xs tracking-[0.2em] text-[#D4AF37] uppercase font-bold block mb-4">
              Calore Siciliano
            </span>
            <h2 className="text-4xl md:text-5xl font-serif mb-6 leading-tight">
              Non sei un numero <br/><span className="italic">di stanza.</span>
            </h2>
            <p className="text-sm leading-relaxed text-gray-600 mb-12">
              L'autentica ospitalità è un'arte. Ogni ospite è trattato come un membro della famiglia.
              Qui troverai sempre un consiglio sincero su dove cenare e la sensazione di essere in un luogo assolutamente sicuro e protetto.
            </p>
          </div>

          {/* Floating review — no frames */}
          <div ref={addToRefs} className="pl-6 border-l border-[#D4AF37]/30 mt-8">
            <div className="flex text-[#D4AF37] text-xs mb-3">
              ★★★★★
            </div>
            <p className="font-serif italic text-lg text-gray-800 mb-4 leading-relaxed">
              "Un angolo di pace raro. Mi sono sentita completamente al sicuro e coccolata. La posizione è centralissima ma c'è un silenzio assoluto."
            </p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">
              Sofia M. — Madrid
            </p>
          </div>
        </div>

        {/* Right column: Portrait (6 cols, offset by 1) */}
        <div className="md:col-span-6 md:col-start-7">
          <div ref={imageWrapRef} className="overflow-hidden aspect-[3/4] w-full">
            <img
              ref={imageRef}
              src="https://images.unsplash.com/photo-1543269664-56d93c1b41a6?q=80&w=800&auto=format&fit=crop"
              alt="La Famiglia Valenti"
              className="w-full h-full object-cover"
            />
          </div>
          <div ref={addToRefs} className="mt-6 text-center md:text-left">
            <p className="font-serif italic text-xl md:text-2xl text-[#0A1128] mb-2">
              "San Vito è il nostro tesoro, e siamo felici di condividerlo con voi."
            </p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
              — Famiglia Valenti
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
