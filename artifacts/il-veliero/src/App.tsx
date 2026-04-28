import React, { useEffect } from 'react';
import { Router as WouterRouter } from 'wouter';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Hero from '@/pages/Hero';
import Story from '@/pages/Story';
import Family from '@/pages/Family';
import Footer from '@/pages/Footer';
import Cursor from '@/components/Cursor';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const lenisRaf = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(lenisRaf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(lenisRaf);
      lenis.destroy();
    };
  }, []);

  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <main className="bg-white min-h-screen overflow-x-hidden relative cursor-none md:cursor-none">
        <Cursor />
        {/* Grain texture overlay */}
        <div className="pointer-events-none fixed inset-0 z-[100] opacity-[0.025]"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")", backgroundRepeat: 'repeat', backgroundSize: '128px 128px' }}
        />
        <Hero />
        <Story />
        <Family />
        <Footer />
      </main>
    </WouterRouter>
  );
}
