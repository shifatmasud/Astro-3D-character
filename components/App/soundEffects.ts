/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // PRE-ALLOCATE / POOL THE WHITE NOISE BUFFER TO AVOID REAL-TIME ALLOCATIONS AND GC FREEZES
      const sampleRate = this.ctx.sampleRate;
      const bufferSize = sampleRate * 3.0; // 3 seconds of high-fidelity white noise loop
      this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    }
  }

  playPunch() {
    this.playSlap();
  }

  playSlap() {
    this.init();
    if (!this.ctx || !this.noiseBuffer) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.12);

    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Reusing pooled noise buffer - zero real-time CPU allocations!
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1500, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.8, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    osc.start(now);
    noise.start(now);
    osc.stop(now + 0.13);
    noise.stop(now + 0.1);
  }

  playSlash() {
    this.init();
    if (!this.ctx || !this.noiseBuffer) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Reusing pooled noise buffer - zero real-time CPU allocations!
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(450, now + 0.15);
    filter.Q.setValueAtTime(3.0, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.16);
  }

  playShoot() {
    this.init();
    if (!this.ctx || !this.noiseBuffer) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Reusing pooled noise buffer - zero real-time CPU allocations!
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1500, now);
    filter.Q.setValueAtTime(1.0, now);

    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);

    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.7, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(1.0, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    noise.start(now);
    osc.start(now);

    noise.stop(now + 0.3);
    osc.stop(now + 0.3);
  }

  playWalk() {
    this.init();
    if (!this.ctx || !this.noiseBuffer) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Subdued cartoony thud oscillator
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(20, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Crisp high-passed foot rattle using the POOLED noise buffer
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2000, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.05, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    osc.start(now);
    noise.start(now);

    osc.stop(now + 0.09);
    noise.stop(now + 0.05);
  }

  private jetpackSource: AudioBufferSourceNode | null = null;
  private jetpackGain: GainNode | null = null;
  private jetpackOsc: OscillatorNode | null = null;

  startJetpack() {
    this.init();
    if (!this.ctx || !this.noiseBuffer) return;
    if (this.jetpackSource) return; // Prevent duplicate jetpack layers

    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Play continuously using our pre-allocated POOLED noise buffer
    this.jetpackSource = ctx.createBufferSource();
    this.jetpackSource.buffer = this.noiseBuffer;
    this.jetpackSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);

    // Warm, heavy rocket engine harmonic rumble oscillator
    this.jetpackOsc = ctx.createOscillator();
    this.jetpackOsc.type = 'sawtooth';
    this.jetpackOsc.frequency.setValueAtTime(55, now);
    
    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.15, now);

    this.jetpackGain = ctx.createGain();
    // Smooth exponential volume fade-in to eliminate pops
    this.jetpackGain.gain.setValueAtTime(0.001, now);
    this.jetpackGain.gain.exponentialRampToValueAtTime(0.4, now + 0.1);

    this.jetpackSource.connect(filter);
    filter.connect(this.jetpackGain);
    
    this.jetpackOsc.connect(oscGain);
    oscGain.connect(this.jetpackGain);

    this.jetpackGain.connect(ctx.destination);

    this.jetpackSource.start(now);
    this.jetpackOsc.start(now);
  }

  stopJetpack() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (this.jetpackGain && this.jetpackSource && this.jetpackOsc) {
      const pGain = this.jetpackGain;
      const pSource = this.jetpackSource;
      const pOsc = this.jetpackOsc;

      pGain.gain.setValueAtTime(pGain.gain.value, now);
      // Fade out slowly to make stopping feel natural and fluid
      pGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      setTimeout(() => {
        try {
          pSource.stop();
          pOsc.stop();
        } catch (e) {}
      }, 100);
    }
    this.jetpackSource = null;
    this.jetpackGain = null;
    this.jetpackOsc = null;
  }

  playTick() {
    this.init();
    if (!this.ctx) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  playEquip() {
    this.init();
    if (!this.ctx) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    // Sleek rising synth confirmation tone
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.16);
  }
}

export const sound = new SoundSynthesizer();
