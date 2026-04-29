import { useEffect, useRef } from 'react';

/**
 * SeaSound — invisible.
 *
 * Simple spec:
 *   • Every tap (click / touch / keypress) plays one 4-second
 *     ocean-wave wash.
 *   • Every SECOND tap also plays a real seagull cry on top.
 *   • That's it. No throttling, no passive listeners, no eager
 *     init — just react to taps.
 */
const SEAGULL_URL = `${import.meta.env.BASE_URL}audio/seagull.mp3`;
const SURF_DURATION = 4;

export default function SeaSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const gullBufferRef = useRef<AudioBuffer | null>(null);
  const noiseBufferRef = useRef<AudioBuffer | null>(null);
  const tapCountRef = useRef<number>(0);

  useEffect(() => {
    /** Brown-noise buffer — sounds like ocean wash once low-passed. */
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

    /** One 4-second ocean-wave wash. */
    const playSurf = (ctx: AudioContext) => {
      const noise = noiseBufferRef.current;
      if (!noise) return;
      const now = ctx.currentTime;
      const dur = SURF_DURATION;

      const src = ctx.createBufferSource();
      src.buffer = noise;
      const offset = Math.random() * Math.max(0, noise.duration - dur - 0.05);

      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 600;
      lp.Q.value = 0.4;

      const peak = 0.55;
      const fadeIn = 0.4;
      const fadeOut = 1.4;

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(peak, now + fadeIn);
      g.gain.setValueAtTime(peak, now + dur - fadeOut);
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

    /** One seagull cry. */
    const playGull = (ctx: AudioContext) => {
      const buffer = gullBufferRef.current;
      if (!buffer) return;
      const now = ctx.currentTime;

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

    /**
     * Single tap handler. Lazily builds the AudioContext on the first
     * tap (so it's inside a user-activation event and the browser
     * autoplay policy is happy), then plays a wave (and maybe a gull).
     */
    const onTap = () => {
      // Lazy init on first tap — guaranteed to be inside a user
      // gesture, so AudioContext is allowed to start in `running`.
      if (!ctxRef.current) {
        const Ctor =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Ctor) return;
        const ctx = new Ctor();
        ctxRef.current = ctx;
        noiseBufferRef.current = makeNoiseBuffer(ctx, 6.0);
        // Fetch + decode seagull in the background — surf already
        // works without it; gull will start playing as soon as the
        // buffer is ready (usually before the 2nd tap).
        void (async () => {
          try {
            const r = await fetch(SEAGULL_URL);
            const ab = await r.arrayBuffer();
            gullBufferRef.current = await ctx.decodeAudioData(ab);
          } catch {
            /* ignore */
          }
        })();
      }

      const ctx = ctxRef.current;
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => undefined);
      }

      tapCountRef.current += 1;
      playSurf(ctx);
      // Every SECOND tap (2nd, 4th, 6th…) plays a gull on top.
      if (tapCountRef.current % 2 === 0) playGull(ctx);
    };

    const opts: AddEventListenerOptions = { passive: true, capture: true };
    window.addEventListener('pointerdown', onTap, opts);
    window.addEventListener('touchstart', onTap, opts);
    window.addEventListener('keydown', onTap, opts);

    return () => {
      window.removeEventListener('pointerdown', onTap, opts);
      window.removeEventListener('touchstart', onTap, opts);
      window.removeEventListener('keydown', onTap, opts);
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
