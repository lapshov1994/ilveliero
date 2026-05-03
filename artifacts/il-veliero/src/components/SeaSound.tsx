import { useEffect, useRef } from 'react';

/**
 * SeaSound — invisible.
 *
 * Spec: every tap (pointerdown / keydown) plays one 4 s ocean-wave
 * wash. Every SECOND tap also plays a real seagull cry on top.
 *
 * Strategy for instant first-tap sound:
 *   • At mount we ONLY pre-fetch the seagull MP3 bytes (an ArrayBuffer
 *     in memory). We do NOT create the AudioContext yet, because some
 *     browsers (notably mobile Safari and any iframe with strict
 *     autoplay policy) refuse to resume a context that was constructed
 *     outside a user gesture, even though the spec says they should.
 *   • On the very first tap (a real user gesture) we synchronously
 *     create the AudioContext, build the brown-noise buffer, kick off
 *     decodeAudioData on the already-fetched bytes, and play the surf.
 *     Decode of a ~600 kB MP3 takes ~10–30 ms, well under the
 *     perceptual threshold, and the network round-trip has already
 *     been amortised.
 *   • Subsequent taps reuse the same context and buffers.
 *
 * Pointer Events ("pointerdown") fire for both mouse and touch on all
 * modern browsers, so we listen to that one event only and avoid the
 * mobile double-count caused by also subscribing to `touchstart`.
 */
const SEAGULL_URL = `${import.meta.env.BASE_URL}audio/seagull.mp3`;
const SURF_DURATION = 4;

export default function SeaSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const gullBytesRef = useRef<ArrayBuffer | null>(null);
  const gullBufferRef = useRef<AudioBuffer | null>(null);
  const noiseBufferRef = useRef<AudioBuffer | null>(null);
  const tapCountRef = useRef<number>(0);
  /**
   * True if an even-numbered tap arrived before the seagull MP3 was
   * decoded. The decode-complete callback will play the gull as soon
   * as the buffer is ready so we don't lose the request.
   */
  const pendingGullRef = useRef<boolean>(false);

  useEffect(() => {
    let cancelled = false;

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

    /**
     * Lazily build the AudioContext on first user gesture. Returns the
     * context, or null if Web Audio is unavailable.
     */
    const ensureContext = (): AudioContext | null => {
      if (ctxRef.current) return ctxRef.current;
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      const ctx = new Ctor();
      ctxRef.current = ctx;
      noiseBufferRef.current = makeNoiseBuffer(ctx, 6.0);

      // Decode the already-fetched MP3 bytes asynchronously. If the
      // bytes haven't arrived yet (very slow network), the decode
      // simply doesn't happen now and the gull stays silent.
      const bytes = gullBytesRef.current;
      if (bytes) {
        // decodeAudioData detaches the ArrayBuffer, so clone it first
        // in case we ever want to retry.
        const slice = bytes.slice(0);
        ctx
          .decodeAudioData(slice)
          .then((buf) => {
            gullBufferRef.current = buf;
            if (pendingGullRef.current && ctx.state === 'running') {
              pendingGullRef.current = false;
              playGull(ctx);
            }
          })
          .catch(() => undefined);
      }
      return ctx;
    };

    // Pre-fetch the seagull MP3 bytes (no AudioContext yet — that
    // gets created lazily on the first user gesture so iframes /
    // mobile Safari can't refuse to ever resume it).
    void (async () => {
      try {
        const r = await fetch(SEAGULL_URL);
        const ab = await r.arrayBuffer();
        if (cancelled) return;
        gullBytesRef.current = ab;
        // If the user already tapped (so the context exists) but we
        // hadn't received the bytes in time to kick off decode in
        // ensureContext, decode them now so the gull isn't lost for
        // the rest of the session.
        const ctx = ctxRef.current;
        if (ctx && !gullBufferRef.current) {
          try {
            const buf = await ctx.decodeAudioData(ab.slice(0));
            if (cancelled) return;
            gullBufferRef.current = buf;
            if (pendingGullRef.current && ctx.state === 'running') {
              pendingGullRef.current = false;
              playGull(ctx);
            }
          } catch {
            /* ignore */
          }
        }
      } catch {
        /* surf will still play; gull just won't */
      }
    })();

    const onTap = () => {
      const ctx = ensureContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => undefined);
      }

      // Drain any gull that was queued while the buffer was decoding.
      if (pendingGullRef.current && gullBufferRef.current) {
        pendingGullRef.current = false;
        playGull(ctx);
      }

      tapCountRef.current += 1;
      playSurf(ctx);
      // Every SECOND tap (2nd, 4th, 6th…) plays a gull on top.
      if (tapCountRef.current % 2 === 0) {
        if (gullBufferRef.current) {
          playGull(ctx);
        } else {
          pendingGullRef.current = true;
        }
      }
    };

    const opts: AddEventListenerOptions = { passive: true, capture: true };
    const supportsPointer = typeof window !== 'undefined' && 'PointerEvent' in window;
    const tapEvents: ReadonlyArray<keyof WindowEventMap> = supportsPointer
      ? ['pointerdown']
      : ['mousedown', 'touchstart'];
    tapEvents.forEach((ev) => window.addEventListener(ev, onTap, opts));
    window.addEventListener('keydown', onTap, opts);

    return () => {
      cancelled = true;
      tapEvents.forEach((ev) => window.removeEventListener(ev, onTap, opts));
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
