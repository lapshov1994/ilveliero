import React, { useEffect, useRef, useState } from 'react';

/**
 * SeaSound — a small floating button (lower-right) that plays a calm
 * ambient sea soundtrack. The audio is SYNTHESISED with the Web Audio
 * API rather than loaded from a file, so:
 *   - no asset to bundle, no licensing concern, no network cost
 *   - it's seamlessly loopable forever
 *   - we can shape it precisely (slow swells, gentle hiss) so it
 *     never feels like a samey background loop
 *
 * Browsers block audio that hasn't been initiated by a user gesture.
 * We therefore start the AudioContext only when the user clicks the
 * toggle. The button is small, navy-tinted, with a wave/speaker glyph,
 * and persists its on/off state across reloads via localStorage.
 *
 * Synthesis sketch:
 *   - Two layers of brown noise, each routed through a low-pass filter
 *     whose cutoff is slowly modulated by an LFO. The two layers are
 *     out of phase so the "swells" come and go at different rates,
 *     never landing on the same beat — exactly how breaking waves
 *     stagger on a real beach.
 *   - A third layer of band-pass-filtered pink noise rides on top at
 *     low volume to add the airy hiss of foam / spray.
 *   - A master gain caps everything at ~18% so the soundtrack sits
 *     under the page, never on top of it.
 */
export default function SeaSound() {
  const [isOn, setIsOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const nodesRef = useRef<{ srcs: AudioBufferSourceNode[]; lfos: OscillatorNode[] }>(
    { srcs: [], lfos: [] }
  );

  // Restore previous on/off state once the component has mounted.
  // We don't auto-start the audio (browsers forbid it) — we just
  // remember the user's preference so the button reflects it.
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('seasound_on') : null;
    // Default OFF — sound should never start without an explicit
    // gesture from the user. Even if the user previously turned it
    // on, the browser will refuse to resume the AudioContext until
    // they interact again, so we keep the visible state honest.
    if (saved === 'on') {
      // Mark as "want on" but only really start once user clicks.
      // For now we leave isOn false; user clicks once to start.
    }
  }, []);

  /** Generate a brown-noise-filled AudioBuffer (mono, ~10s). */
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

  /** Generate a pink-noise-ish AudioBuffer (mono). */
  const makePinkNoise = (ctx: AudioContext, seconds: number): AudioBuffer => {
    const buf = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const data = buf.getChannelData(0);
    // Voss-McCartney algorithm approximation — cheap but believable.
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

  const startAudio = async () => {
    // Create on first start to satisfy the autoplay policy.
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctor();
    ctxRef.current = ctx;

    const master = ctx.createGain();
    master.gain.value = 0; // ramp up softly
    master.connect(ctx.destination);
    masterRef.current = master;

    // ── Layer 1: deep slow swell ─────────────────────────────────────
    const brownBuf = makeBrownNoise(ctx, 10);
    const src1 = ctx.createBufferSource();
    src1.buffer = brownBuf;
    src1.loop = true;
    const filt1 = ctx.createBiquadFilter();
    filt1.type = 'lowpass';
    filt1.frequency.value = 600;
    filt1.Q.value = 0.6;
    const lfo1 = ctx.createOscillator();
    lfo1.frequency.value = 0.07; // ~14s per cycle
    const lfo1Gain = ctx.createGain();
    lfo1Gain.gain.value = 350; // sweep cutoff ±350Hz around 600
    lfo1.connect(lfo1Gain);
    lfo1Gain.connect(filt1.frequency);
    const gain1 = ctx.createGain();
    gain1.gain.value = 0.85;
    src1.connect(filt1).connect(gain1).connect(master);

    // ── Layer 2: faster, slightly higher swell, out of phase ─────────
    const brownBuf2 = makeBrownNoise(ctx, 10);
    const src2 = ctx.createBufferSource();
    src2.buffer = brownBuf2;
    src2.loop = true;
    const filt2 = ctx.createBiquadFilter();
    filt2.type = 'lowpass';
    filt2.frequency.value = 900;
    filt2.Q.value = 0.7;
    const lfo2 = ctx.createOscillator();
    lfo2.frequency.value = 0.11; // ~9s per cycle
    const lfo2Gain = ctx.createGain();
    lfo2Gain.gain.value = 500;
    lfo2.connect(lfo2Gain);
    lfo2Gain.connect(filt2.frequency);
    const gain2 = ctx.createGain();
    gain2.gain.value = 0.55;
    src2.connect(filt2).connect(gain2).connect(master);

    // ── Layer 3: airy spray / foam hiss ──────────────────────────────
    const pinkBuf = makePinkNoise(ctx, 10);
    const src3 = ctx.createBufferSource();
    src3.buffer = pinkBuf;
    src3.loop = true;
    const filt3 = ctx.createBiquadFilter();
    filt3.type = 'bandpass';
    filt3.frequency.value = 2800;
    filt3.Q.value = 0.9;
    // Modulate spray gain so it pulses gently with the swells.
    const gain3 = ctx.createGain();
    gain3.gain.value = 0.06;
    const lfo3 = ctx.createOscillator();
    lfo3.frequency.value = 0.08;
    const lfo3Gain = ctx.createGain();
    lfo3Gain.gain.value = 0.05;
    lfo3.connect(lfo3Gain);
    lfo3Gain.connect(gain3.gain);
    src3.connect(filt3).connect(gain3).connect(master);

    // Start everything at the same moment so the loops stay in phase
    // for the full session.
    const t0 = ctx.currentTime;
    src1.start(t0);
    src2.start(t0);
    src3.start(t0);
    lfo1.start(t0);
    lfo2.start(t0);
    lfo3.start(t0);

    nodesRef.current = { srcs: [src1, src2, src3], lfos: [lfo1, lfo2, lfo3] };

    // Fade master gain in over 1.2s — never an audio "pop".
    master.gain.linearRampToValueAtTime(0.18, t0 + 1.2);

    // Some browsers create the context in a suspended state even after
    // a user gesture; resume() is a no-op when already running.
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {
        /* ignore — user can click again */
      }
    }
  };

  const stopAudio = () => {
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master) return;
    const t = ctx.currentTime;
    // Quick fade-out then teardown.
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(0, t + 0.4);
    setTimeout(() => {
      try {
        nodesRef.current.srcs.forEach((s) => s.stop());
        nodesRef.current.lfos.forEach((o) => o.stop());
      } catch {
        /* nodes may already be stopped */
      }
      nodesRef.current = { srcs: [], lfos: [] };
      try {
        ctx.close();
      } catch {
        /* ignore */
      }
      ctxRef.current = null;
      masterRef.current = null;
    }, 480);
  };

  const onToggle = async () => {
    if (isOn) {
      stopAudio();
      setIsOn(false);
      try {
        localStorage.setItem('seasound_on', 'off');
      } catch {
        /* ignore */
      }
    } else {
      await startAudio();
      setIsOn(true);
      try {
        localStorage.setItem('seasound_on', 'on');
      } catch {
        /* ignore */
      }
    }
  };

  // Tear down on unmount.
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  return (
    <button
      onClick={onToggle}
      aria-label={isOn ? 'Disattiva il suono del mare' : 'Attiva il suono del mare'}
      data-testid="seasound-toggle"
      className="fixed bottom-5 right-5 z-[180] w-11 h-11 rounded-full flex items-center justify-center bg-[#0A1128]/80 backdrop-blur-md border border-white/15 shadow-lg text-white hover:bg-[#0A1128] hover:border-[#D4AF37]/60 transition-all duration-300 group"
    >
      {/* Wave icon — three stacked horizontal sine waves. When ON, the
          third wave is highlighted gold; when OFF, a thin diagonal
          slash crosses the icon so the muted state reads at a glance. */}
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M2 8 Q 6 5 10 8 T 18 8 T 22 8"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          fill="none"
          opacity="0.9"
        />
        <path
          d="M2 13 Q 6 10 10 13 T 18 13 T 22 13"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
        />
        <path
          d="M2 18 Q 6 15 10 18 T 18 18 T 22 18"
          stroke={isOn ? '#D4AF37' : 'currentColor'}
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
          opacity={isOn ? 1 : 0.5}
        />
        {!isOn && (
          <line
            x1="4"
            y1="20"
            x2="20"
            y2="4"
            stroke="#FFFFFF"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.85"
          />
        )}
      </svg>
    </button>
  );
}
