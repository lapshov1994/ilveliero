import { useEffect, useRef } from 'react';

/**
 * SeaSound — invisible.
 *
 * Spec: every tap (pointerdown / keydown) plays one 4 s ocean-wave
 * wash. Every SECOND tap also plays a real seagull cry on top.
 *
 * Pointer Events ("pointerdown") fire for both mouse and touch on
 * every modern browser, so we deliberately do NOT also listen to
 * "touchstart" — doing so double-counts a single physical tap on
 * mobile and breaks the 1-tap / 2-tap sequence.
 */
const SEAGULL_URL = `${import.meta.env.BASE_URL}audio/seagull.mp3`;
const SURF_DURATION = 4;

export default function SeaSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const gullBufferRef = useRef<AudioBuffer | null>(null);
  const noiseBufferRef = useRef<AudioBuffer | null>(null);
  const tapCountRef = useRef<number>(0);
  /**
   * Set to true if an even-numbered tap fires BEFORE the seagull MP3
   * has finished decoding. As soon as decoding completes, we play the
   * deferred gull immediately so the user still hears it.
   */
  const pendingGullRef = useRef<boolean>(false);

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

      // 50 ms fade-in keeps the wave instantly audible on tap while
      // avoiding a click. 1.4 s fade-out keeps the natural decay.
      const peak = 0.55;
      const fadeIn = 0.05;
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

    // Eager init: build context (suspended is fine), noise pad, and
    // decode the seagull MP3 now so the first tap has nothing to wait
    // for. decodeAudioData works on a suspended context.
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (Ctor) {
      const ctx = new Ctor();
      ctxRef.current = ctx;
      noiseBufferRef.current = makeNoiseBuffer(ctx, 6.0);

      void (async () => {
        try {
          const r = await fetch(SEAGULL_URL);
          const ab = await r.arrayBuffer();
          gullBufferRef.current = await ctx.decodeAudioData(ab);
          // If a 2nd-tap-style trigger arrived while we were still
          // decoding, play the gull now so the user still hears it.
          if (pendingGullRef.current && ctx.state === 'running') {
            pendingGullRef.current = false;
            playGull(ctx);
          }
        } catch {
          /* surf still plays without the gull */
        }
      })();
    }

    const onTap = () => {
      const ctx = ctxRef.current;
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => undefined);
      }

      tapCountRef.current += 1;
      playSurf(ctx);
      // Every SECOND tap (2nd, 4th, 6th…) plays a gull on top. If
      // the gull buffer hasn't finished decoding yet, remember the
      // request so the decode-complete callback can play it.
      if (tapCountRef.current % 2 === 0) {
        if (gullBufferRef.current) {
          playGull(ctx);
        } else {
          pendingGullRef.current = true;
        }
      }
    };

    // Pointer Events fire for both mouse and touch — DO NOT also
    // listen to touchstart (would double-count one physical tap).
    const opts: AddEventListenerOptions = { passive: true, capture: true };
    const supportsPointer = typeof window !== 'undefined' && 'PointerEvent' in window;
    const tapEvent = supportsPointer ? 'pointerdown' : 'touchstart';
    window.addEventListener(tapEvent, onTap, opts);
    window.addEventListener('keydown', onTap, opts);

    return () => {
      window.removeEventListener(tapEvent, onTap, opts);
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
