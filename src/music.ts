/**
 * Christmas Music Player
 * Plays background Christmas music from MP3 file
 */

export class ChristmasMusicPlayer {
  private audio: HTMLAudioElement | null = null;
  private isMuted: boolean = false;
  private isInitialized: boolean = false;
  private shouldBePlaying: boolean = false;

  constructor() {
    // Will be initialized on user interaction
  }

  /** Initialize audio (must be called after user interaction) */
  init(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    this.audio = new Audio('/music.mp3');
    this.audio.loop = true;
    this.audio.volume = this.isMuted ? 0 : 0.3;
    this.audio.preload = 'auto';

    // If we should already be playing, start now
    if (this.shouldBePlaying && !this.isMuted) {
      this.audio.play().catch((e) => {
        console.log('Music autoplay blocked:', e);
      });
    }
  }

  /** Start playing music */
  start(): void {
    this.shouldBePlaying = true;

    if (!this.isInitialized) {
      // Will start playing when init() is called after user interaction
      return;
    }

    if (this.audio && !this.isMuted) {
      this.audio.play().catch((e) => {
        console.log('Music play blocked:', e);
      });
    }
  }

  /** Stop playing music */
  stop(): void {
    this.shouldBePlaying = false;
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
  }

  /** Set mute state */
  setMuted(muted: boolean): void {
    this.isMuted = muted;

    if (this.audio) {
      this.audio.volume = muted ? 0 : 0.3;

      if (!muted && this.shouldBePlaying && this.audio.paused) {
        this.audio.play().catch((e) => {
          console.log('Music play on unmute blocked:', e);
        });
      }
    }
  }

  /** Check if muted */
  getMuted(): boolean {
    return this.isMuted;
  }

  /** Play a victory jingle - music continues */
  playVictoryJingle(): void {
    // The main music continues, victory sound effects handle the celebration
  }
}
