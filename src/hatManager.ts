import gsap from 'gsap';
import type { Hat, Position, GameConfig, Ornament } from './types';

/** Enhanced Santa hat SVG */
const HAT_SVG = `
<svg viewBox="0 0 100 85" class="hat-svg" aria-hidden="true">
  <defs>
    <linearGradient id="hatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#e63946"/>
      <stop offset="50%" style="stop-color:#c41e3a"/>
      <stop offset="100%" style="stop-color:#9b1b30"/>
    </linearGradient>
    <linearGradient id="furGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#ffffff"/>
      <stop offset="100%" style="stop-color:#e8e8e8"/>
    </linearGradient>
    <filter id="hatGlow">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Hat body -->
  <path d="M5 72 Q5 40 25 20 Q45 2 60 12 Q85 25 92 60 Q93 68 90 72 Z"
        fill="url(#hatGrad)" filter="url(#hatGlow)"/>

  <!-- Highlight -->
  <path d="M18 55 Q22 35 40 22 Q48 17 52 18"
        stroke="rgba(255,255,255,0.25)" stroke-width="6" fill="none" stroke-linecap="round"/>

  <!-- Fur trim -->
  <ellipse cx="48" cy="74" rx="44" ry="10" fill="url(#furGrad)"/>
  <path d="M4 74 Q12 68 22 74 Q32 68 42 74 Q52 68 62 74 Q72 68 82 74 Q92 68 96 74"
        stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/>

  <!-- Pompom string -->
  <path d="M60 12 Q75 6 85 15" stroke="#c41e3a" stroke-width="5" fill="none" stroke-linecap="round"/>

  <!-- Pompom -->
  <circle cx="86" cy="17" r="11" fill="url(#furGrad)"/>
  <circle cx="83" cy="14" r="4" fill="#fff"/>
  <circle cx="89" cy="15" r="3" fill="#fff"/>
  <circle cx="85" cy="20" r="4" fill="#f8f8f8"/>
</svg>
`;

/** Manages falling and thrown Santa hats */
export class HatManager {
  private hats: Map<number, Hat> = new Map();
  private nextHatId: number = 0;
  private container: HTMLElement;
  private config: GameConfig;
  private spawnInterval: number | null = null;
  private animationId: number | null = null;
  private isRunning: boolean = false;
  private pickedHat: Hat | null = null;
  private mousePos: Position = { x: 0, y: 0 };
  private lastMousePos: Position = { x: 0, y: 0 };

  private onHatPlaced: ((ornamentId: number) => void) | null = null;
  private onHatPickedUp: (() => void) | null = null;
  private getOrnamentAtPosition: ((pos: Position) => Ornament | null) | null = null;

  constructor(container: HTMLElement, config: GameConfig) {
    this.container = container;
    this.config = config;
    this.setupEventListeners();
  }

  /** Set callbacks */
  setOnHatPlaced(callback: (ornamentId: number) => void): void {
    this.onHatPlaced = callback;
  }

  setOnHatPickedUp(callback: () => void): void {
    this.onHatPickedUp = callback;
  }

  setGetOrnamentAtPosition(callback: (pos: Position) => Ornament | null): void {
    this.getOrnamentAtPosition = callback;
  }

  /** Start the hat system */
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    // Spawn first hat soon
    setTimeout(() => this.spawnHat(), 800);

    this.spawnInterval = window.setInterval(() => {
      this.spawnHat();
    }, this.config.hatSpawnInterval);

    this.animate();
  }

  /** Stop the hat system */
  stop(): void {
    this.isRunning = false;
    if (this.spawnInterval) {
      clearInterval(this.spawnInterval);
      this.spawnInterval = null;
    }
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /** Animation loop for physics */
  private animate = (): void => {
    if (!this.isRunning) return;

    this.hats.forEach((hat, id) => {
      if (hat.isThrown && !hat.isPlaced) {
        this.updateThrownHat(hat, id);
      } else if (!hat.isPickedUp && !hat.isPlaced && !hat.isThrown) {
        this.updateFallingHat(hat, id);
      }
    });

    this.animationId = requestAnimationFrame(this.animate);
  };

  /** Update a falling hat */
  private updateFallingHat(hat: Hat, id: number): void {
    hat.y += hat.vy;
    hat.x += hat.vx;
    hat.rotation += 0.5;

    // Wobble
    hat.vx = Math.sin(hat.y * 0.02) * 0.8;

    // Remove if off screen
    if (hat.y > window.innerHeight + 100) {
      this.removeHat(id);
      return;
    }

    gsap.set(hat.element, {
      x: hat.x,
      y: hat.y,
      rotation: hat.rotation
    });
  }

  /** Update a thrown hat */
  private updateThrownHat(hat: Hat, id: number): void {
    // Apply gravity
    hat.vy += 0.3;
    hat.y += hat.vy;
    hat.x += hat.vx;
    hat.rotation += hat.vx * 0.5;

    // Check collision with ornaments
    if (this.getOrnamentAtPosition) {
      const ornament = this.getOrnamentAtPosition({ x: hat.x + 40, y: hat.y + 35 });
      if (ornament && !ornament.leader.hasHat) {
        this.landHatOnOrnament(hat, ornament);
        return;
      }
    }

    // Remove if off screen
    if (hat.y > window.innerHeight + 100 || hat.x < -100 || hat.x > window.innerWidth + 100) {
      this.removeHat(id);
      return;
    }

    gsap.set(hat.element, {
      x: hat.x,
      y: hat.y,
      rotation: hat.rotation
    });
  }

  /** Land hat on an ornament */
  private landHatOnOrnament(hat: Hat, ornament: Ornament): void {
    hat.isPlaced = true;
    hat.isThrown = false;

    gsap.killTweensOf(hat.element);
    hat.element.classList.add('placed');

    // Animate to ornament
    gsap.to(hat.element, {
      x: ornament.x + 15,
      y: ornament.y - 5,
      rotation: -5 + Math.random() * 10,
      scale: 0.6,
      duration: 0.25,
      ease: 'back.out(1.5)',
      onComplete: () => {
        if (this.onHatPlaced) {
          this.onHatPlaced(ornament.id);
        }
      }
    });
  }

  /** Spawn a new falling hat */
  private spawnHat(): void {
    const fallingHats = Array.from(this.hats.values()).filter(
      h => !h.isPickedUp && !h.isPlaced && !h.isThrown
    );
    if (fallingHats.length >= this.config.maxFallingHats) return;

    const id = this.nextHatId++;
    const element = document.createElement('div');
    element.className = 'falling-hat';
    element.innerHTML = HAT_SVG;
    element.setAttribute('role', 'button');
    element.setAttribute('aria-label', 'Santa hat - click to grab');
    element.setAttribute('tabindex', '0');
    element.dataset.hatId = String(id);

    const x = 80 + Math.random() * (window.innerWidth - 200);
    const y = -100;

    const hat: Hat = {
      id,
      element,
      x,
      y,
      vx: 0,
      vy: 1.5 + Math.random() * 1,
      rotation: Math.random() * 30 - 15,
      isPickedUp: false,
      isPlaced: false,
      isThrown: false
    };

    this.hats.set(id, hat);
    this.container.appendChild(element);

    gsap.set(element, { x, y, rotation: hat.rotation, scale: 0.9 });

    // Entrance pop
    gsap.to(element, {
      scale: 1,
      duration: 0.3,
      ease: 'back.out(2)'
    });
  }

  /** Pick up a hat */
  pickUpHat(id: number): boolean {
    if (this.pickedHat) return false;

    const hat = this.hats.get(id);
    if (!hat || hat.isPickedUp || hat.isPlaced || hat.isThrown) return false;

    hat.isPickedUp = true;
    this.pickedHat = hat;

    hat.element.classList.add('picked-up');
    gsap.to(hat.element, {
      scale: 1.2,
      rotation: 0,
      duration: 0.2,
      ease: 'back.out(2)'
    });

    if (this.onHatPickedUp) {
      this.onHatPickedUp();
    }

    return true;
  }

  /** Throw the picked hat */
  throwHat(): void {
    if (!this.pickedHat) return;

    const hat = this.pickedHat;
    this.pickedHat = null;

    hat.isPickedUp = false;
    hat.isThrown = true;
    hat.element.classList.remove('picked-up');
    hat.element.classList.add('thrown');

    // Calculate throw velocity based on mouse movement
    const vx = (this.mousePos.x - this.lastMousePos.x) * 0.5;
    const vy = (this.mousePos.y - this.lastMousePos.y) * 0.5 - 5; // Add upward boost

    hat.vx = Math.max(-15, Math.min(15, vx));
    hat.vy = Math.max(-20, Math.min(10, vy));

    gsap.to(hat.element, {
      scale: 0.9,
      duration: 0.15
    });
  }

  /** Drop currently held hat (without throwing) */
  dropHat(): void {
    if (!this.pickedHat) return;

    const hat = this.pickedHat;
    this.pickedHat = null;
    hat.isPickedUp = false;
    hat.element.classList.remove('picked-up');

    // Just let it fall
    hat.vy = 2;
    hat.vx = 0;
  }

  /** Update picked hat position */
  updatePickedHatPosition(pos: Position): void {
    this.lastMousePos = { ...this.mousePos };
    this.mousePos = pos;

    if (!this.pickedHat) return;

    this.pickedHat.x = pos.x - 40;
    this.pickedHat.y = pos.y - 35;

    gsap.set(this.pickedHat.element, {
      x: this.pickedHat.x,
      y: this.pickedHat.y
    });
  }

  /** Check if holding a hat */
  isHoldingHat(): boolean {
    return this.pickedHat !== null;
  }

  /** Remove a hat */
  private removeHat(id: number): void {
    const hat = this.hats.get(id);
    if (hat) {
      gsap.to(hat.element, {
        opacity: 0,
        scale: 0.5,
        duration: 0.2,
        onComplete: () => {
          hat.element.remove();
          this.hats.delete(id);
        }
      });
    }
  }

  /** Clear all hats */
  clearAll(): void {
    this.stop();
    this.pickedHat = null;
    this.hats.forEach(hat => {
      gsap.killTweensOf(hat.element);
      hat.element.remove();
    });
    this.hats.clear();
  }

  /** Setup event listeners */
  private setupEventListeners(): void {
    // Click to pick up hat
    this.container.addEventListener('mousedown', (e) => {
      const target = e.target as HTMLElement;
      const hatElement = target.closest('.falling-hat') as HTMLElement;
      if (hatElement && !hatElement.classList.contains('placed') && !hatElement.classList.contains('thrown')) {
        const id = parseInt(hatElement.dataset.hatId || '-1', 10);
        if (id >= 0) {
          this.pickUpHat(id);
        }
      }
    });

    // Release to throw
    document.addEventListener('mouseup', () => {
      if (this.pickedHat) {
        this.throwHat();
      }
    });

    // Touch support
    this.container.addEventListener('touchstart', (e) => {
      const target = e.target as HTMLElement;
      const hatElement = target.closest('.falling-hat') as HTMLElement;
      if (hatElement && !hatElement.classList.contains('placed') && !hatElement.classList.contains('thrown')) {
        const id = parseInt(hatElement.dataset.hatId || '-1', 10);
        if (id >= 0) {
          this.pickUpHat(id);
          const touch = e.touches[0];
          this.mousePos = { x: touch.clientX, y: touch.clientY };
          this.lastMousePos = { ...this.mousePos };
        }
      }
    }, { passive: true });

    document.addEventListener('touchend', () => {
      if (this.pickedHat) {
        this.throwHat();
      }
    });

    // Track mouse/touch position
    document.addEventListener('mousemove', (e) => {
      this.updatePickedHatPosition({ x: e.clientX, y: e.clientY });
    });

    document.addEventListener('touchmove', (e) => {
      if (this.pickedHat && e.touches.length > 0) {
        this.updatePickedHatPosition({
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        });
      }
    }, { passive: true });

    // Keyboard support
    this.container.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const target = e.target as HTMLElement;
        if (target.classList.contains('falling-hat') && !target.classList.contains('placed')) {
          e.preventDefault();
          const id = parseInt(target.dataset.hatId || '-1', 10);
          if (id >= 0) {
            // For keyboard, pick up and throw in direction of mouse
            if (this.pickUpHat(id)) {
              setTimeout(() => this.throwHat(), 100);
            }
          }
        }
      }
    });
  }
}
