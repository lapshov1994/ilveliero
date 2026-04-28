import React, { useEffect } from 'react';
import { Router as WouterRouter } from 'wouter';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Hero from '@/pages/Hero';
import Story from '@/pages/Story';

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
      <main className="bg-white min-h-screen overflow-x-hidden relative">
        <Hero />
        <Story />
      </main>
    </WouterRouter>
  );
}
