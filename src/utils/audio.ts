/**
 * Web Audio API procedural sound synthesizer for Boardroom Royale
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  public volume: number = 0.6;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public playShoot(type: 'pistol' | 'rifle' | 'shotgun' | 'sniper' | 'cash_cannon' | 'briefcase_launcher') {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume * 0.45, t);
    masterGain.connect(this.ctx.destination);

    if (type === 'pistol') {
      // Crisp staple snap
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.exponentialRampToValueAtTime(100, t + 0.08);

      gain.gain.setValueAtTime(0.7, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(t);
      osc.stop(t + 0.08);

      // Noise click
      this.playNoiseClick(t, 0.04, 0.3, masterGain);
    } else if (type === 'rifle') {
      // Rapid tape snap
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(450, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.1);

      gain.gain.setValueAtTime(0.65, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(t);
      osc.stop(t + 0.1);
      this.playNoiseClick(t, 0.06, 0.4, masterGain);
    } else if (type === 'shotgun') {
      // Heavy briefcase slam blast
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.22);

      gain.gain.setValueAtTime(0.9, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(t);
      osc.stop(t + 0.22);
      this.playNoiseClick(t, 0.15, 0.7, masterGain);
    } else if (type === 'sniper') {
      // High-frequency executive laser beam zap
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1800, t);
      osc.frequency.exponentialRampToValueAtTime(150, t + 0.28);

      gain.gain.setValueAtTime(0.8, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.28);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(t);
      osc.stop(t + 0.28);
    } else if (type === 'cash_cannon') {
      // High pitch bill flutter & cash register chime
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.setValueAtTime(1200, t + 0.04);

      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(t);
      osc.stop(t + 0.12);
    } else {
      // Briefcase rocket blast
      this.playExplosion();
    }
  }

  private playNoiseClick(t: number, duration: number, vol: number, destination: AudioNode) {
    if (!this.ctx) return;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(destination);
    noise.start(t);
  }

  public playHit(isCrit: boolean = false) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = isCrit ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(isCrit ? 900 : 350, t);
    osc.frequency.exponentialRampToValueAtTime(isCrit ? 1200 : 150, t + 0.07);

    gain.gain.setValueAtTime(this.volume * (isCrit ? 0.6 : 0.4), t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.07);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.07);
  }

  public playShieldBreak() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(700, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.18);

    gain.gain.setValueAtTime(this.volume * 0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.18);
  }

  public playLootPickup(type: string) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = type === 'weapon' ? [523, 659, 783] : [440, 554, 659];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.04);
      gain.gain.setValueAtTime(this.volume * 0.35, t + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.04 + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + idx * 0.04);
      osc.stop(t + idx * 0.04 + 0.1);
    });
  }

  public playReload() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    [0, 0.18].forEach((delay) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(500, t + delay);
      osc.frequency.exponentialRampToValueAtTime(250, t + delay + 0.06);
      gain.gain.setValueAtTime(this.volume * 0.4, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.01, t + delay + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + delay);
      osc.stop(t + delay + 0.06);
    });
  }

  public playExplosion() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.4);

    gain.gain.setValueAtTime(this.volume * 0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.4);

    this.playNoiseClick(t, 0.35, 0.8, this.ctx.destination);
  }

  public playAbility(charId: string) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    if (charId === 'barker') {
      // Canine bark burst
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, t);
      osc.frequency.setValueAtTime(380, t + 0.05);
      osc.frequency.exponentialRampToValueAtTime(120, t + 0.2);

      gain.gain.setValueAtTime(this.volume * 0.8, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.2);
    } else if (charId === 'sterling') {
      // Golden forcefield chime
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.3);

      gain.gain.setValueAtTime(this.volume * 0.7, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.35);
    } else if (charId === 'mortimer') {
      // Smoke puff whoosh
      this.playNoiseClick(t, 0.28, 0.6, this.ctx.destination);
    } else {
      // Golden cash dash fanfare
      [523, 659, 784, 1046].forEach((f, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, t + i * 0.05);
        gain.gain.setValueAtTime(this.volume * 0.4, t + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.05 + 0.1);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + i * 0.05);
        osc.stop(t + i * 0.05 + 0.1);
      });
    }
  }

  public playStormWarning() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.linearRampToValueAtTime(240, t + 0.3);
    osc.frequency.linearRampToValueAtTime(320, t + 0.6);

    gain.gain.setValueAtTime(this.volume * 0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.65);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.65);
  }

  public playVictory() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [392, 523, 659, 784, 1046];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.12);
      gain.gain.setValueAtTime(this.volume * 0.6, t + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.12 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + idx * 0.12);
      osc.stop(t + idx * 0.12 + 0.35);
    });
  }

  public playElimination() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [587, 440, 293];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t + idx * 0.12);
      gain.gain.setValueAtTime(this.volume * 0.5, t + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.12 + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + idx * 0.12);
      osc.stop(t + idx * 0.12 + 0.25);
    });
  }
}

export const sound = new SoundEngine();
