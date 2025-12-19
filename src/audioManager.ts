/**
 * Christmas Sound Effects Manager
 * Uses Web Audio API to create festive sounds
 */

export class AudioManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private isInitialized: boolean = false;

  constructor() {
    // Sounds will be initialized on first user interaction
  }

  /** Initialize audio context (call after user interaction) */
  init(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.connect(this.audioContext.destination);
    this.masterGain.gain.value = this.isMuted ? 0 : 0.25; // Lower overall volume
  }

  /** Set mute state */
  setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : 0.25;
    }
  }

  /** Play a soft "ho" sound - for picking up hat */
  playPickup(): void {
    if (this.isMuted || !this.audioContext || !this.masterGain) return;

    const now = this.audioContext.currentTime;

    // Deep, warm "ho" sound
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.15);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.25);

    // Add soft sleigh bell shimmer
    this.playSoftBell(now + 0.05, 0.04);
  }

  /** Play "ho ho" chime - for placing hat */
  playPlace(): void {
    if (this.isMuted || !this.audioContext || !this.masterGain) return;

    const now = this.audioContext.currentTime;

    // Two "ho" sounds
    [0, 0.15].forEach((delay, i) => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();

      osc.type = 'sine';
      const baseFreq = i === 0 ? 160 : 140;
      osc.frequency.setValueAtTime(baseFreq, now + delay);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, now + delay + 0.12);

      gain.gain.setValueAtTime(0, now + delay);
      gain.gain.linearRampToValueAtTime(0.1, now + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.18);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now + delay);
      osc.stop(now + delay + 0.25);
    });

    // Warm chime on top
    this.playWarmChime(now + 0.1, 0.06);
  }

  /** Play victory "ho ho ho" fanfare */
  playVictory(): void {
    if (this.isMuted || !this.audioContext || !this.masterGain) return;

    const now = this.audioContext.currentTime;

    // Three jolly "ho ho ho" sounds
    [0, 0.2, 0.4].forEach((delay, i) => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();

      osc.type = 'sine';
      // Descending pitch for jolly effect
      const baseFreq = 180 - i * 20;
      osc.frequency.setValueAtTime(baseFreq, now + delay);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.65, now + delay + 0.15);

      gain.gain.setValueAtTime(0, now + delay);
      gain.gain.linearRampToValueAtTime(0.12, now + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now + delay);
      osc.stop(now + delay + 0.3);
    });

    // Celebratory chimes
    this.playWarmChime(now + 0.6, 0.08);
    this.playWarmChime(now + 0.75, 0.08);
    this.playWarmChime(now + 0.9, 0.1);

    // Soft bells
    for (let i = 0; i < 4; i++) {
      this.playSoftBell(now + 0.7 + i * 0.1, 0.05);
    }
  }

  /** Helper: Play a soft sleigh bell */
  private playSoftBell(startTime: number, volume: number): void {
    if (!this.audioContext || !this.masterGain) return;

    const freq = 1800 + Math.random() * 400;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + 0.15);
  }

  /** Helper: Play a warm Christmas chime */
  private playWarmChime(startTime: number, volume: number): void {
    if (!this.audioContext || !this.masterGain) return;

    // Warm major chord frequencies
    const freqs = [392, 494, 587]; // G4, B4, D5

    freqs.forEach((freq, i) => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();

      osc.type = 'triangle';
      osc.frequency.value = freq;

      const delay = i * 0.03;
      gain.gain.setValueAtTime(0, startTime + delay);
      gain.gain.linearRampToValueAtTime(volume, startTime + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + delay + 0.3);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(startTime + delay);
      osc.stop(startTime + delay + 0.35);
    });
  }
}
