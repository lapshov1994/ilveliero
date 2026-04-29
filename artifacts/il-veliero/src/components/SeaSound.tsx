import { useEffect, useRef } from 'react';

/**
 * SeaSound — invisible.
 *
 * Simple rule: every touch (or click / first user gesture) plays
 *   - a 0.7-second burst of synthesised surf
 *   - the real seagull cry on top
 *
 * That's it. No scheduling, no intensity, no decay.
 */
const SEAGULL_URL = `${import.meta.env.BASE_URL}audio/seagull.mp3`;

export default function SeaSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const gullBufferRef = useRef<AudioBuffer | null>(null);
  const noiseBufferRef = useRef<AudioBuffer | null>(null);

  useEffect(() => {
    /** White-then-low-passed noise buffer — sounds like surf. */
    const makeNoiseBuffer = (ctx: AudioContext, seconds: number): AudioBuffer => {
      const buf = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
      const data = buf.getChannelData(0);
      let last = 0;
      for (let i = 0; i < data.length; i++) {
        const w = Math.random() * 2 - 1;
        last = (last + 0.02 * w) / 1.02;
        data[i] = last * 3.5;
      }
      return buf;
    };

    /**
     * Lazily create the AudioContext on the first user gesture
     * (browsers reject context creation/resume otherwise) and
     * decode the seagull MP3 once.
     */
    const ensureContext = async (): Promise<AudioContext | null> => {
      if (ctxRef.current) return ctxRef.current;

      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;

      const ctx = new Ctor();
      ctxRef.current = ctx;
      noiseBufferRef.current = makeNoiseBuffer(ctx, 1.5);

      if (ctx.state === 'suspended') {
        try {
          await ctx.resume();
        } catch {
          /* ignore */
        }
      }

      // Fetch + decode the seagull recording. First touch may fire
      // before this resolves — that's fine, the cry will simply
      // start playing on the next touch once the buffer is ready.
      try {
        const r = await fetch(SEAGULL_URL);
        const ab = await r.arrayBuffer();
        gullBufferRef.current = await ctx.decodeAudioData(ab);
      } catch {
        /* ignore — surf still plays */
      }

      return ctx;
    };

    /** Play 0.7s of surf noise. */
    const playSurf = (ctx: AudioContext) => {
      const noise = noiseBufferRef.current;
      if (!noise) return;
      const now = ctx.currentTime;
      const dur = 0.7;

      const src = ctx.createBufferSource();
      src.buffer = noise;
      // Random start offset within the 1.5s noise buffer for variety.
      const offset = Math.random() * (noise.duration - dur - 0.05);

      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 800;
      lp.Q.value = 0.6;

      const g = ctx.createGain();
      // Soft fade-in / fade-out so the burst feels like a wave wash.
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.45, now + 0.1);
      g.gain.setValueAtTime(0.45, now + dur - 0.18);
      g.gain.exponentialRampToValueAtTime(0.0005, now + dur);

      src.connect(lp).connect(g).connect(ctx.destination);
      src.start(now, offset, dur + 0.05);
      src.stop(now + dur + 0.05);

      setTimeout(() => {
        try {
          src.disconnect();
          lp.disconnect();
          g.disconnect();
        } catch {
          /* ignore */
        }
      }, (dur + 0.5) * 1000);
    };

    /** Play one seagull cry on top of the surf. */
    const playGull = (ctx: AudioContext) => {
      const buffer = gullBufferRef.current;
      if (!buffer) return;
      const now = ctx.currentTime;

      // 0.9..1.6s slice of the source recording.
      const sliceDur = 0.9 + Math.random() * 0.7;
      const maxStart = Math.max(0, buffer.duration - sliceDur - 0.05);
      const startOffset = Math.random() * maxStart;

      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const rate = 0.9 + Math.random() * 0.2;
      src.playbackRate.value = rate;
      const ctxDur = sliceDur / rate;

      const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      if (pan) pan.pan.value = (Math.random() * 2 - 1) * 0.6;

      const peakGain = 0.95;
      const fadeTail = Math.min(0.18, ctxDur * 0.25);

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(peakGain, now + 0.04);
      g.gain.setValueAtTime(peakGain, now + Math.max(0.05, ctxDur - fadeTail));
      g.gain.exponentialRampToValueAtTime(0.0005, now + ctxDur);

      if (pan) {
        src.connect(g).connect(pan).connect(ctx.destination);
      } else {
        src.connect(g).connect(ctx.destination);
      }

      src.start(now, startOffset, sliceDur + 0.05);
      src.stop(now + ctxDur + 0.05);

      setTimeout(() => {
        try {
          src.disconnect();
          g.disconnect();
          if (pan) pan.disconnect();
        } catch {
          /* ignore */
        }
      }, (ctxDur + 0.5) * 1000);
    };

    /** Single handler: ensure context, then play surf + gull. */
    const onGesture = () => {
      void ensureContext().then((ctx) => {
        if (!ctx) return;
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => undefined);
        }
        playSurf(ctx);
        playGull(ctx);
      });
    };

    window.addEventListener('touchstart', onGesture, { passive: true });
    window.addEventListener('click', onGesture, { passive: true });

    return () => {
      window.removeEventListener('touchstart', onGesture);
      window.removeEventListener('click', onGesture);
      const ctx = ctxRef.current;
      if (ctx) {
        try {
          ctx.close();
        } catch {
          /* ignore */
        }
        ctxRef.current = null;
      }
    };
  }, []);

  return null;
}
