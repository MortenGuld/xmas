import './style.css';
import { GameState, DEFAULT_CONFIG } from './gameState';
import { OrnamentManager } from './ornamentManager';
import { HatManager } from './hatManager';
import { Snowfall } from './snowfall';
import { AudioManager } from './audioManager';
import { createChristmasLights, createStars, createSparkleBurst, celebrateVictory, createAurora } from './effects';
import type { GameConfig } from './types';
import confetti from 'canvas-confetti';

// ==========================================
// EDIT NAMES HERE - Easy to customize!
// ==========================================
const LEADER_NAMES: string[] = [
  "Arne",
  "Michael",
  "Erling",
  "Kinga",
  "Lotte",
  "Morten",
  "Klaus",
  "Karolina",
  "Pawel"
];

// Game configuration
const CONFIG: GameConfig = {
  ...DEFAULT_CONFIG,
  leaderNames: LEADER_NAMES,
  maxFallingHats: 3,
  hatSpawnInterval: 2500,
  ornamentSpeed: 0.8,
  throwSpeed: 15
};

// ==========================================
// Game initialization
// ==========================================

class Game {
  private gameState: GameState;
  private ornamentManager: OrnamentManager;
  private hatManager: HatManager;
  private snowfall: Snowfall;
  private audio: AudioManager;
  private gameContainer: HTMLElement;
  private progressText: HTMLElement;
  private progressFill: HTMLElement;
  private overlay: HTMLElement;

  constructor() {
    this.gameContainer = document.getElementById('game-container')!;
    this.progressText = document.querySelector('.progress-text')!;
    this.progressFill = document.getElementById('progress-fill')!;
    this.overlay = document.getElementById('overlay')!;

    this.gameState = new GameState(CONFIG);
    this.ornamentManager = new OrnamentManager(this.gameContainer, CONFIG);
    this.hatManager = new HatManager(this.gameContainer, CONFIG);
    this.snowfall = new Snowfall(document.getElementById('snowfall-container')!);
    this.audio = new AudioManager();

    this.setupEffects();
    this.setupCallbacks();
    this.setupKeyboardShortcuts();
    this.setupFirstInteraction();
  }

  /** Setup visual effects */
  private setupEffects(): void {
    const effectsContainer = document.getElementById('effects-container')!;
    createChristmasLights(effectsContainer);
    createStars(effectsContainer, 60);
    createAurora(effectsContainer);
  }

  /** Initialize and start the game */
  start(): void {
    this.ornamentManager.init(this.gameState.getLeaders());
    this.ornamentManager.start();
    this.updateProgress();
    this.snowfall.start();
    this.hatManager.start();
    this.updateMuteButton();
  }

  /** Setup all callbacks */
  private setupCallbacks(): void {
    // When a hat lands on an ornament
    this.hatManager.setOnHatPlaced((ornamentId: number) => {
      const ornament = this.ornamentManager.getOrnament(ornamentId);
      if (ornament) {
        this.gameState.placeHat(ornamentId);
        this.ornamentManager.placeHatOnOrnament(ornamentId);

        // Sparkle effect
        createSparkleBurst(
          ornament.x + 50,
          ornament.y + 40,
          16
        );

        // Mini confetti
        confetti({
          particleCount: 30,
          spread: 60,
          origin: {
            x: (ornament.x + 50) / window.innerWidth,
            y: (ornament.y + 50) / window.innerHeight
          },
          colors: ['#ffd700', '#c41e3a', '#00843d']
        });

        this.audio.playPlace();
        this.updateProgress();

        // Check victory
        if (this.gameState.isComplete()) {
          this.onVictory();
        }
      }
    });

    // When hat is picked up
    this.hatManager.setOnHatPickedUp(() => {
      this.audio.playPickup();
      document.body.classList.add('holding-hat');
    });

    // Set collision detection
    this.hatManager.setGetOrnamentAtPosition((pos) => {
      return this.ornamentManager.getOrnamentAtPosition(pos);
    });

    // Mute toggle
    document.getElementById('mute-btn')?.addEventListener('click', () => {
      this.toggleMute();
    });

    // Play again
    document.getElementById('play-again-btn')?.addEventListener('click', () => {
      this.reset();
    });

    // Track when not holding hat
    document.addEventListener('mouseup', () => {
      setTimeout(() => {
        if (!this.hatManager.isHoldingHat()) {
          document.body.classList.remove('holding-hat');
        }
      }, 50);
    });
  }

  /** Update progress display */
  private updateProgress(): void {
    const state = this.gameState.getState();
    this.progressText.textContent = `${state.hatsPlaced} / ${state.totalLeaders}`;

    const percentage = (state.hatsPlaced / state.totalLeaders) * 100;
    this.progressFill.style.width = `${percentage}%`;
  }

  /** Update mute button */
  private updateMuteButton(): void {
    const btn = document.getElementById('mute-btn');
    const isMuted = this.gameState.getMuted();
    if (btn) {
      btn.innerHTML = isMuted
        ? '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>';
      btn.setAttribute('aria-label', isMuted ? 'Unmute' : 'Mute');
    }
  }

  /** Toggle mute */
  private toggleMute(): void {
    const isMuted = this.gameState.toggleMute();
    this.audio.setMuted(isMuted);
    this.updateMuteButton();
  }

  /** Setup keyboard shortcuts */
  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'r' && !e.ctrlKey && !e.metaKey) {
        this.reset();
      }
      if (e.key.toLowerCase() === 'm' && !e.ctrlKey && !e.metaKey) {
        this.toggleMute();
      }
      if (e.key === 'Escape') {
        this.hatManager.dropHat();
        document.body.classList.remove('holding-hat');
      }
    });
  }

  /** Setup first interaction for audio */
  private setupFirstInteraction(): void {
    const initAudio = () => {
      if (!this.gameState.getInteracted()) {
        this.gameState.setInteracted();
        this.audio.init();
        this.audio.setMuted(this.gameState.getMuted());
      }
    };

    ['click', 'touchstart', 'keydown'].forEach(event => {
      document.addEventListener(event, initAudio, { once: true });
    });
  }

  /** Handle victory */
  private onVictory(): void {
    this.hatManager.stop();
    this.audio.playVictory();

    setTimeout(() => {
      this.overlay.classList.add('visible');
      celebrateVictory();
    }, 800);
  }

  /** Reset the game */
  private reset(): void {
    this.overlay.classList.remove('visible');
    this.hatManager.clearAll();
    this.gameState.reset();
    this.ornamentManager.clear();
    this.ornamentManager.init(this.gameState.getLeaders());
    this.ornamentManager.start();
    this.updateProgress();
    this.hatManager.start();
    document.body.classList.remove('holding-hat');
  }
}

// ==========================================
// Start game when DOM is ready
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  game.start();
});
