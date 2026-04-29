import { useEffect, useRef } from 'react';

/**
 * SeaSound — invisible. Once the user makes ANY interaction
 * (mouse move, scroll, tap), a soft sea soundscape begins playing
 * and continues for the rest of the visit:
 *
 *   - A continuous synthesised surf (two slow brown-noise swells +
 *     a faint pink-noise foam layer) at a steady, gentle level so
 *     the seaside is always present in the background.
 *   - A real European Herring Gull (XC707075) cry calls out every
 *     5–10 seconds, with random pitch and stereo placement so
 *     consecutive cries feel like different birds.
 *
 * The MP3 bytes are pre-fetched on mount so the very first cry
 * fires the instant the user interacts — no race against decode.
 */
const SEAGULL_URL = `${import.meta.env.BASE_URL}audio/seagull.mp3`;

export default function SeaSound() {
  // Pre-fetched MP3 bytes (raw ArrayBuffer). Cached on mount so we
  // can decode them the moment the AudioContext is created.
  const gullBytesRef = useRef<ArrayBuffer | null>(null);
  // Decoded buffer, reused for every cry once available.
  const gullBufferRef = useRef<AudioBuffer | null>(null);

  const ctxRef = useRef<AudioContext | null>(null);
  const surfMasterRef = useRef<GainNode | null>(null);
  const gullMasterRef = useRef<GainNode | null>(null);
  const startedRef = useRef(false);
  const gullTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Pre-fetch MP3 bytes immediately so the cry can play within
    // tens of ms of the user's first interaction, not after a 500ms
    // network round-trip.
    fetch(SEAGULL_URL)
      .then((r) => r.arrayBuffer())
      .then((ab) => {
        gullBytesRef.current = ab;
      })
      .catch(() => undefined);

    /** Brown noise buffer (mono). */
    const makeBrownNoise = (ctx: AudioContext, seconds: number): AudioBuffer => {
      const buf = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
      const data = buf.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < data.length; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 3.5;
      }
      return buf;
    };

    /** Pink noise (Voss-McCartney approximation). */
    const makePinkNoise = (ctx: AudioContext, seconds: number): AudioBuffer => {
      const buf = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
      const data = buf.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < data.length; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
      return buf;
    };

    /** Play one seagull cry from the loaded recording. */
    const playSeagull = () => {
      const ctx = ctxRef.current;
      const dest = gullMasterRef.current;
      const buffer = gullBufferRef.current;
      if (!ctx || !dest || !buffer) return;

      const now = ctx.currentTime + 0.02;
      // Each cry uses a 0.9..1.6s slice of the source recording.
      const sliceDur = 0.9 + Math.random() * 0.7;
      const maxStart = Math.max(0, buffer.duration - sliceDur - 0.05);
      const startOffset = Math.random() * maxStart;

      const src = ctx.createBufferSource();
      src.buffer = buffer;
      // Subtle pitch variation so each cry differs (±2 semitones).
      const rate = 0.88 + Math.random() * 0.24;
      src.playbackRate.value = rate;

      // Length in CONTEXT time = source seconds / playback rate.
      const ctxDur = sliceDur / rate;

      const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      if (pan) pan.pan.value = (Math.random() * 2 - 1) * 0.75;

      // "Distance" — closer vs farther cries.
      const distance = 0.55 + Math.random() * 0.45;
      const peakGain = 0.95 * distance;
      const fadeTail = Math.min(0.18, ctxDur * 0.25);

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(peakGain, now + 0.04);
      g.gain.setValueAtTime(peakGain, now + Math.max(0.05, ctxDur - fadeTail));
      g.gain.exponentialRampToValueAtTime(0.0005, now + ctxDur);

      if (pan) {
        src.connect(g).connect(pan).connect(dest);
      } else {
        src.connect(g).connect(dest);
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
     * Schedule the next cry 5–10 seconds from now. Self-rescheduling.
     */
    const scheduleNextGull = () => {
      if (gullTimerRef.current) clearTimeout(gullTimerRef.current);
      const delay = 5000 + Math.random() * 5000;
      gullTimerRef.current = setTimeout(() => {
        playSeagull();
        scheduleNextGull();
      }, delay);
    };

    /**
     * Build & start the soundscape exactly once, on the user's first
     * gesture. From then on, surf plays continuously at a gentle
     * background level and gulls call every 5–10s.
     */
    const ensureStarted = () => {
      if (startedRef.current) return;
      startedRef.current = true;

      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      const ctx = new Ctor();
      ctxRef.current = ctx;

      // Surf master — held at a steady, gentle background level.
      // Ramp up smoothly from zero over the first second so the
      // soundscape fades in rather than slamming on at full volume.
      const surfMaster = ctx.createGain();
      surfMaster.gain.setValueAtTime(0, ctx.currentTime);
      surfMaster.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 1.2);
      surfMaster.connect(ctx.destination);
      surfMasterRef.current = surfMaster;

      // Gull master — full volume always, so cries are clearly
      // audible whenever they fire.
      const gullMaster = ctx.createGain();
      gullMaster.gain.value = 1.0;
      gullMaster.connect(ctx.destination);
      gullMasterRef.current = gullMaster;

      // Layer 1 — deep slow swell.
      const brown1 = ctx.createBufferSource();
      brown1.buffer = makeBrownNoise(ctx, 10);
      brown1.loop = true;
      const lp1 = ctx.createBiquadFilter();
      lp1.type = 'lowpass';
      lp1.frequency.value = 600;
      lp1.Q.value = 0.6;
      const lfo1 = ctx.createOscillator();
      lfo1.frequency.value = 0.07;
      const lfo1Gain = ctx.createGain();
      lfo1Gain.gain.value = 350;
      lfo1.connect(lfo1Gain);
      lfo1Gain.connect(lp1.frequency);
      const g1 = ctx.createGain();
      g1.gain.value = 0.85;
      brown1.connect(lp1).connect(g1).connect(surfMaster);

      // Layer 2 — faster swell, out of phase with layer 1.
      const brown2 = ctx.createBufferSource();
      brown2.buffer = makeBrownNoise(ctx, 10);
      brown2.loop = true;
      const lp2 = ctx.createBiquadFilter();
      lp2.type = 'lowpass';
      lp2.frequency.value = 900;
      lp2.Q.value = 0.7;
      const lfo2 = ctx.createOscillator();
      lfo2.frequency.value = 0.11;
      const lfo2Gain = ctx.createGain();
      lfo2Gain.gain.value = 500;
      lfo2.connect(lfo2Gain);
      lfo2Gain.connect(lp2.frequency);
      const g2 = ctx.createGain();
      g2.gain.value = 0.55;
      brown2.connect(lp2).connect(g2).connect(surfMaster);

      // Layer 3 — band-passed pink noise (foam / spray).
      const pink = ctx.createBufferSource();
      pink.buffer = makePinkNoise(ctx, 10);
      pink.loop = true;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 2800;
      bp.Q.value = 0.9;
      const g3 = ctx.createGain();
      g3.gain.value = 0.06;
      const lfo3 = ctx.createOscillator();
      lfo3.frequency.value = 0.08;
      const lfo3Gain = ctx.createGain();
      lfo3Gain.gain.value = 0.05;
      lfo3.connect(lfo3Gain);
      lfo3Gain.connect(g3.gain);
      pink.connect(bp).connect(g3).connect(surfMaster);

      const t0 = ctx.currentTime;
      brown1.start(t0);
      brown2.start(t0);
      pink.start(t0);
      lfo1.start(t0);
      lfo2.start(t0);
      lfo3.start(t0);

      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => undefined);
      }

      // Decode the pre-fetched MP3 bytes (or fetch+decode if the
      // pre-fetch hasn't completed yet). Once decoded, fire the
      // first cry immediately and start the cycle.
      const startGulls = (decoded: AudioBuffer) => {
        gullBufferRef.current = decoded;
        playSeagull();
        scheduleNextGull();
      };

      const bytes = gullBytesRef.current;
      if (bytes) {
        // Slice the buffer because some implementations consume the
        // ArrayBuffer during decode, which would prevent re-decoding
        // if anything ever wanted to retry.
        ctx.decodeAudioData(bytes.slice(0)).then(startGulls).catch(() => undefined);
      } else {
        // Pre-fetch wasn't ready — fetch+decode now.
        fetch(SEAGULL_URL)
          .then((r) => r.arrayBuffer())
          .then((ab) => ctx.decodeAudioData(ab))
          .then(startGulls)
          .catch(() => undefined);
      }
    };

    const onInteraction = () => {
      ensureStarted();
      const c = ctxRef.current;
      if (c?.state === 'suspended') c.resume().catch(() => undefined);
    };

    window.addEventListener('mousemove', onInteraction, { passive: true });
    window.addEventListener('scroll', onInteraction, { passive: true });
    window.addEventListener('touchstart', onInteraction, { passive: true });
    window.addEventListener('click', onInteraction, { passive: true });
    window.addEventListener('keydown', onInteraction);

    return () => {
      window.removeEventListener('mousemove', onInteraction);
      window.removeEventListener('scroll', onInteraction);
      window.removeEventListener('touchstart', onInteraction);
      window.removeEventListener('click', onInteraction);
      window.removeEventListener('keydown', onInteraction);
      if (gullTimerRef.current) clearTimeout(gullTimerRef.current);
      const ctx = ctxRef.current;
      if (ctx) {
        try {
          ctx.close();
        } catch {
          /* ignore */
        }
        ctxRef.current = null;
        surfMasterRef.current = null;
        gullMasterRef.current = null;
      }
    };
  }, []);

  return null;
}
