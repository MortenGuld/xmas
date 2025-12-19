import gsap from 'gsap';
import confetti from 'canvas-confetti';
import type { Leader, GameStateData } from './types';
import { generateAvatar } from './avatars';

/** UI Manager - handles all DOM rendering and updates */
export class UI {
  private gridContainer: HTMLElement;
  private progressElement: HTMLElement;
  private progressFill: HTMLElement;
  private overlayElement: HTMLElement;
  private muteButton: HTMLElement;
  private holdingIndicator: HTMLElement;
  private onLeaderClick: ((leader: Leader, element: HTMLElement) => void) | null = null;
  private onPlayAgain: (() => void) | null = null;
  private onMuteToggle: (() => void) | null = null;

  constructor() {
    this.gridContainer = document.getElementById('leaders-grid')!;
    this.progressElement = document.getElementById('progress')!;
    this.progressFill = document.getElementById('progress-fill')!;
    this.overlayElement = document.getElementById('overlay')!;
    this.muteButton = document.getElementById('mute-btn')!;
    this.holdingIndicator = document.getElementById('holding-indicator')!;

    this.setupMuteButton();
    this.setupOverlayButton();
  }

  /** Render the leadership grid */
  renderLeaders(leaders: Leader[]): void {
    this.gridContainer.innerHTML = '';

    leaders.forEach((leader, index) => {
      const card = document.createElement('div');
      card.className = 'leader-card';
      card.dataset.leaderId = String(leader.id);
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `${leader.name}'s card - ${leader.hasHat ? 'has hat' : 'needs hat'}`);
      card.setAttribute('tabindex', '0');

      const avatarWrapper = document.createElement('div');
      avatarWrapper.className = 'avatar-wrapper';

      const avatar = document.createElement('div');
      avatar.className = 'avatar';
      avatar.innerHTML = generateAvatar(leader.name);

      const glow = document.createElement('div');
      glow.className = 'avatar-glow';

      const name = document.createElement('span');
      name.className = 'leader-name';
      name.textContent = leader.name;

      avatarWrapper.appendChild(glow);
      avatarWrapper.appendChild(avatar);
      card.appendChild(avatarWrapper);
      card.appendChild(name);

      if (leader.hasHat) {
        card.classList.add('has-hat');
      }

      // Click handler
      card.addEventListener('click', () => {
        if (this.onLeaderClick && !leader.hasHat) {
          this.onLeaderClick(leader, card);
        }
      });

      // Keyboard handler
      card.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !leader.hasHat) {
          e.preventDefault();
          if (this.onLeaderClick) {
            this.onLeaderClick(leader, card);
          }
        }
      });

      this.gridContainer.appendChild(card);

      // Staggered entrance animation
      gsap.from(card, {
        opacity: 0,
        y: 50,
        scale: 0.8,
        rotation: -5,
        duration: 0.6,
        delay: 0.1 + index * 0.1,
        ease: 'back.out(1.7)'
      });
    });
  }

  /** Update a specific leader card */
  updateLeaderCard(leaderId: number, hasHat: boolean): void {
    const card = this.gridContainer.querySelector(`[data-leader-id="${leaderId}"]`) as HTMLElement;
    if (card) {
      if (hasHat) {
        card.classList.add('has-hat');
        card.setAttribute('aria-label', card.getAttribute('aria-label')?.replace('needs hat', 'has hat') || '');

        // Celebration animation
        const timeline = gsap.timeline();
        timeline
          .to(card, {
            scale: 1.15,
            duration: 0.15,
            ease: 'power2.out'
          })
          .to(card, {
            scale: 1,
            duration: 0.3,
            ease: 'elastic.out(1, 0.5)'
          });

        // Add sparkle effect
        this.createSparkles(card);
      }
    }
  }

  /** Create sparkle effect on element */
  private createSparkles(element: HTMLElement): void {
    const rect = element.getBoundingClientRect();
    const colors = ['#ffd700', '#fff', '#ff6b6b', '#4ecdc4'];

    for (let i = 0; i < 8; i++) {
      const sparkle = document.createElement('div');
      sparkle.className = 'sparkle';
      sparkle.style.cssText = `
        position: fixed;
        width: 8px;
        height: 8px;
        background: ${colors[i % colors.length]};
        border-radius: 50%;
        pointer-events: none;
        z-index: 1000;
      `;

      document.body.appendChild(sparkle);

      const startX = rect.left + rect.width / 2;
      const startY = rect.top + rect.height / 2;
      const angle = (i / 8) * Math.PI * 2;
      const distance = 60 + Math.random() * 40;

      gsap.set(sparkle, { x: startX, y: startY, scale: 0 });
      gsap.to(sparkle, {
        x: startX + Math.cos(angle) * distance,
        y: startY + Math.sin(angle) * distance,
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
      gsap.to(sparkle, {
        opacity: 0,
        scale: 0,
        duration: 0.3,
        delay: 0.3,
        onComplete: () => sparkle.remove()
      });
    }
  }

  /** Update progress display */
  updateProgress(state: GameStateData): void {
    this.progressElement.querySelector('.progress-text')!.textContent =
      `${state.hatsPlaced} of ${state.totalLeaders} hats placed`;

    // Update progress bar
    const percentage = (state.hatsPlaced / state.totalLeaders) * 100;
    gsap.to(this.progressFill, {
      width: `${percentage}%`,
      duration: 0.5,
      ease: 'power2.out'
    });

    // Pulse animation on progress
    if (state.hatsPlaced > 0 && state.hatsPlaced < state.totalLeaders) {
      gsap.to(this.progressElement, {
        scale: 1.05,
        duration: 0.15,
        yoyo: true,
        repeat: 1,
        ease: 'power2.out'
      });
    }
  }

  /** Show holding indicator */
  showHoldingIndicator(): void {
    this.holdingIndicator.classList.add('visible');
    gsap.fromTo(this.holdingIndicator,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
    );
  }

  /** Hide holding indicator */
  hideHoldingIndicator(): void {
    gsap.to(this.holdingIndicator, {
      opacity: 0,
      y: -10,
      duration: 0.2,
      onComplete: () => this.holdingIndicator.classList.remove('visible')
    });
  }

  /** Update mute button state */
  updateMuteButton(isMuted: boolean): void {
    this.muteButton.innerHTML = isMuted
      ? '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>';
    this.muteButton.setAttribute('aria-label', isMuted ? 'Sound off - press to unmute' : 'Sound on - press to mute');
  }

  /** Show the victory overlay */
  showVictoryOverlay(): void {
    this.overlayElement.classList.add('visible');
    this.overlayElement.setAttribute('aria-hidden', 'false');

    // Animate overlay content
    gsap.fromTo('.overlay-content', {
      opacity: 0,
      scale: 0.8,
      y: 30
    }, {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.6,
      delay: 0.2,
      ease: 'back.out(1.5)'
    });

    // Focus the play again button for accessibility
    setTimeout(() => {
      const playAgainBtn = document.getElementById('play-again-btn');
      playAgainBtn?.focus();
    }, 800);

    // Trigger confetti celebration
    this.triggerConfetti();
  }

  /** Hide the victory overlay */
  hideOverlay(): void {
    gsap.to('.overlay-content', {
      opacity: 0,
      scale: 0.9,
      duration: 0.3,
      onComplete: () => {
        this.overlayElement.classList.remove('visible');
        this.overlayElement.setAttribute('aria-hidden', 'true');
      }
    });
  }

  /** Trigger confetti celebration */
  private triggerConfetti(): void {
    const duration = 4000;
    const end = Date.now() + duration;

    const colors = ['#c41e3a', '#00843d', '#ffd700', '#ffffff', '#ff6b6b'];

    // Initial big burst
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors,
      startVelocity: 45
    });

    // Continuous side cannons
    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors,
        startVelocity: 35
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors,
        startVelocity: 35
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    setTimeout(frame, 500);

    // Extra bursts
    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 120,
        origin: { x: 0.3, y: 0.5 },
        colors
      });
    }, 1000);

    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 120,
        origin: { x: 0.7, y: 0.5 },
        colors
      });
    }, 1500);
  }

  /** Set leader click callback */
  setOnLeaderClick(callback: (leader: Leader, element: HTMLElement) => void): void {
    this.onLeaderClick = callback;
  }

  /** Set play again callback */
  setOnPlayAgain(callback: () => void): void {
    this.onPlayAgain = callback;
  }

  /** Set mute toggle callback */
  setOnMuteToggle(callback: () => void): void {
    this.onMuteToggle = callback;
  }

  /** Setup mute button */
  private setupMuteButton(): void {
    this.muteButton.addEventListener('click', () => {
      if (this.onMuteToggle) this.onMuteToggle();
    });
  }

  /** Setup overlay play again button */
  private setupOverlayButton(): void {
    const playAgainBtn = document.getElementById('play-again-btn');
    playAgainBtn?.addEventListener('click', () => {
      if (this.onPlayAgain) this.onPlayAgain();
    });
  }

  /** Get the avatar element for a leader */
  getAvatarElement(leaderId: number): HTMLElement | null {
    const card = this.gridContainer.querySelector(`[data-leader-id="${leaderId}"]`);
    return card?.querySelector('.avatar') || null;
  }

  /** Reset UI state */
  reset(): void {
    this.hideOverlay();
    this.hideHoldingIndicator();
  }
}
