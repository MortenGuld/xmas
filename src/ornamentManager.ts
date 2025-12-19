import gsap from 'gsap';
import type { Ornament, Leader, GameConfig, Position } from './types';
import { generateAvatar } from './avatars';

/** Ornament colors for variety */
const ORNAMENT_COLORS = [
  { primary: '#c41e3a', secondary: '#8b0000', glow: 'rgba(196, 30, 58, 0.5)' },
  { primary: '#00843d', secondary: '#005a2b', glow: 'rgba(0, 132, 61, 0.5)' },
  { primary: '#ffd700', secondary: '#daa520', glow: 'rgba(255, 215, 0, 0.5)' },
  { primary: '#4169e1', secondary: '#27408b', glow: 'rgba(65, 105, 225, 0.5)' },
  { primary: '#9932cc', secondary: '#6b238e', glow: 'rgba(153, 50, 204, 0.5)' },
  { primary: '#ff6b6b', secondary: '#cc5555', glow: 'rgba(255, 107, 107, 0.5)' },
  { primary: '#20b2aa', secondary: '#178b84', glow: 'rgba(32, 178, 170, 0.5)' },
  { primary: '#ff8c00', secondary: '#cc7000', glow: 'rgba(255, 140, 0, 0.5)' },
  { primary: '#da70d6', secondary: '#af5aab', glow: 'rgba(218, 112, 214, 0.5)' },
];

/** Creates the ornament SVG shell */
function createOrnamentSVG(color: typeof ORNAMENT_COLORS[0]): string {
  return `
    <svg class="ornament-shell" viewBox="0 0 120 140" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="ornamentGrad-${color.primary.slice(1)}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color.primary};stop-opacity:0.3"/>
          <stop offset="50%" style="stop-color:${color.secondary};stop-opacity:0.2"/>
          <stop offset="100%" style="stop-color:${color.primary};stop-opacity:0.3"/>
        </linearGradient>
        <filter id="glow-${color.primary.slice(1)}">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <clipPath id="ornamentClip">
          <circle cx="60" cy="75" r="52"/>
        </clipPath>
      </defs>

      <!-- String -->
      <path d="M60 0 Q65 10 60 20" stroke="#8B4513" stroke-width="2" fill="none"/>

      <!-- Cap/Top -->
      <rect x="50" y="15" width="20" height="12" rx="2" fill="#ffd700"/>
      <rect x="48" y="25" width="24" height="5" rx="1" fill="#daa520"/>
      <ellipse cx="60" cy="16" rx="6" ry="3" fill="#ffd700"/>

      <!-- Main ornament glow -->
      <circle cx="60" cy="75" r="54" fill="${color.glow}" filter="url(#glow-${color.primary.slice(1)})" class="ornament-glow"/>

      <!-- Main ornament body -->
      <circle cx="60" cy="75" r="52" fill="url(#ornamentGrad-${color.primary.slice(1)})" stroke="${color.primary}" stroke-width="3"/>

      <!-- Glass shine effect -->
      <ellipse cx="45" cy="55" rx="15" ry="20" fill="rgba(255,255,255,0.15)" transform="rotate(-20 45 55)"/>
      <ellipse cx="40" cy="50" rx="8" ry="12" fill="rgba(255,255,255,0.2)" transform="rotate(-20 40 50)"/>
    </svg>
  `;
}

/** Manages floating ornaments containing team members */
export class OrnamentManager {
  private ornaments: Map<number, Ornament> = new Map();
  private container: HTMLElement;
  private config: GameConfig;
  private animationId: number | null = null;
  private lastTime: number = 0;
  private bounds = { width: 0, height: 0, padding: 80 };
  private onOrnamentClick: ((ornament: Ornament) => void) | null = null;

  constructor(container: HTMLElement, config: GameConfig) {
    this.container = container;
    this.config = config;
    this.updateBounds();
    window.addEventListener('resize', () => this.updateBounds());
  }

  /** Update container bounds */
  private updateBounds(): void {
    const rect = this.container.getBoundingClientRect();
    this.bounds.width = rect.width;
    this.bounds.height = rect.height;
  }

  /** Initialize ornaments with leaders */
  init(leaders: Leader[]): void {
    this.clear();

    // Calculate grid layout to avoid overlap
    const ornamentSize = 120; // Approximate ornament size
    const minSpacing = 140; // Minimum space between ornament centers
    const padding = 100;

    const availableWidth = this.bounds.width - padding * 2;
    const availableHeight = this.bounds.height - padding * 2;

    // Calculate grid dimensions
    const cols = Math.max(3, Math.min(5, Math.floor(availableWidth / minSpacing)));
    const rows = Math.ceil(leaders.length / cols);

    // Calculate actual spacing
    const spacingX = availableWidth / cols;
    const spacingY = Math.min(availableHeight / rows, minSpacing * 1.2);

    // Center the grid vertically
    const gridHeight = (rows - 1) * spacingY + ornamentSize;
    const startY = Math.max(padding, (this.bounds.height - gridHeight) / 2);

    leaders.forEach((leader, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);

      // Offset odd rows for visual interest
      const rowOffset = row % 2 === 1 ? spacingX * 0.3 : 0;

      // Add some randomness but keep within bounds
      const randomX = (Math.random() - 0.5) * 30;
      const randomY = (Math.random() - 0.5) * 20;

      const x = padding + col * spacingX + spacingX / 2 - ornamentSize / 2 + rowOffset + randomX;
      const y = startY + row * spacingY + randomY;

      // Clamp to ensure visibility
      const clampedX = Math.max(padding, Math.min(this.bounds.width - ornamentSize - padding, x));
      const clampedY = Math.max(padding, Math.min(this.bounds.height - ornamentSize - padding, y));

      this.createOrnament(leader, clampedX, clampedY, index);
    });
  }

  /** Create a single ornament */
  private createOrnament(leader: Leader, x: number, y: number, index: number): Ornament {
    const color = ORNAMENT_COLORS[index % ORNAMENT_COLORS.length];

    const element = document.createElement('div');
    element.className = 'floating-ornament';
    element.dataset.ornamentId = String(leader.id);
    element.setAttribute('role', 'button');
    element.setAttribute('aria-label', `${leader.name} - click to place hat`);
    element.setAttribute('tabindex', '0');

    // Create ornament structure
    element.innerHTML = `
      <div class="ornament-container">
        ${createOrnamentSVG(color)}
        <div class="ornament-avatar">
          ${generateAvatar(leader.name)}
        </div>
        <div class="ornament-hat-slot"></div>
      </div>
      <div class="ornament-name">${leader.name}</div>
      <div class="ornament-shadow"></div>
    `;

    this.container.appendChild(element);

    const ornament: Ornament = {
      id: leader.id,
      leader,
      element,
      x,
      y,
      vx: (Math.random() - 0.5) * this.config.ornamentSpeed,
      vy: (Math.random() - 0.5) * this.config.ornamentSpeed,
      rotation: Math.random() * 10 - 5,
      rotationSpeed: (Math.random() - 0.5) * 0.3,
      bobPhase: Math.random() * Math.PI * 2,
      bobSpeed: 0.5 + Math.random() * 0.5,
      scale: 0.9 + Math.random() * 0.2
    };

    this.ornaments.set(leader.id, ornament);

    // Set initial position
    gsap.set(element, {
      x: ornament.x,
      y: ornament.y,
      scale: 0,
      rotation: ornament.rotation
    });

    // Entrance animation
    gsap.to(element, {
      scale: ornament.scale,
      duration: 0.8,
      delay: index * 0.1,
      ease: 'elastic.out(1, 0.5)'
    });

    // Click handler
    element.addEventListener('click', () => {
      if (this.onOrnamentClick && !leader.hasHat) {
        this.onOrnamentClick(ornament);
      }
    });

    // Keyboard handler
    element.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && !leader.hasHat) {
        e.preventDefault();
        if (this.onOrnamentClick) {
          this.onOrnamentClick(ornament);
        }
      }
    });

    return ornament;
  }

  /** Start the animation loop */
  start(): void {
    if (this.animationId !== null) return;
    this.lastTime = performance.now();
    this.animate();
  }

  /** Stop the animation loop */
  stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /** Main animation loop */
  private animate = (): void => {
    const now = performance.now();
    const delta = (now - this.lastTime) / 1000;
    this.lastTime = now;

    this.ornaments.forEach(ornament => {
      if (ornament.leader.hasHat) {
        // Gentle floating for completed ornaments
        this.updateCompletedOrnament(ornament, now);
      } else {
        // Active floating for incomplete ornaments
        this.updateActiveOrnament(ornament, delta, now);
      }
    });

    this.animationId = requestAnimationFrame(this.animate);
  };

  /** Update active (no hat) ornament */
  private updateActiveOrnament(ornament: Ornament, _delta: number, now: number): void {
    // Apply velocity
    ornament.x += ornament.vx;
    ornament.y += ornament.vy;

    // Collision avoidance with other ornaments
    const minDistance = 110; // Minimum distance between ornament centers
    for (const other of this.ornaments.values()) {
      if (other.id === ornament.id) continue;

      const dx = ornament.x - other.x;
      const dy = ornament.y - other.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < minDistance && distance > 0) {
        // Push ornaments apart
        const pushStrength = (minDistance - distance) * 0.02;
        const nx = dx / distance;
        const ny = dy / distance;

        ornament.vx += nx * pushStrength;
        ornament.vy += ny * pushStrength;
      }
    }

    // Bobbing motion
    const bobOffset = Math.sin(now * 0.001 * ornament.bobSpeed + ornament.bobPhase) * 8;

    // Boundary bouncing with padding
    const padding = this.bounds.padding;
    const size = 100;

    if (ornament.x < padding) {
      ornament.x = padding;
      ornament.vx *= -0.8;
    } else if (ornament.x > this.bounds.width - padding - size) {
      ornament.x = this.bounds.width - padding - size;
      ornament.vx *= -0.8;
    }

    if (ornament.y < padding) {
      ornament.y = padding;
      ornament.vy *= -0.8;
    } else if (ornament.y > this.bounds.height - padding - size) {
      ornament.y = this.bounds.height - padding - size;
      ornament.vy *= -0.8;
    }

    // Slight rotation
    ornament.rotation += ornament.rotationSpeed;

    // Apply random gentle forces occasionally
    if (Math.random() < 0.01) {
      ornament.vx += (Math.random() - 0.5) * 0.5;
      ornament.vy += (Math.random() - 0.5) * 0.5;
    }

    // Dampen velocity
    ornament.vx *= 0.995;
    ornament.vy *= 0.995;

    // Clamp velocity
    const maxSpeed = this.config.ornamentSpeed * 2;
    ornament.vx = Math.max(-maxSpeed, Math.min(maxSpeed, ornament.vx));
    ornament.vy = Math.max(-maxSpeed, Math.min(maxSpeed, ornament.vy));

    // Update element position
    gsap.set(ornament.element, {
      x: ornament.x,
      y: ornament.y + bobOffset,
      rotation: ornament.rotation
    });
  }

  /** Update completed (has hat) ornament - gentle floating */
  private updateCompletedOrnament(ornament: Ornament, now: number): void {
    const bobOffset = Math.sin(now * 0.001 * ornament.bobSpeed * 0.5 + ornament.bobPhase) * 5;
    const swayOffset = Math.sin(now * 0.0005 + ornament.bobPhase) * 3;

    gsap.set(ornament.element, {
      x: ornament.x + swayOffset,
      y: ornament.y + bobOffset,
      rotation: Math.sin(now * 0.001) * 2
    });
  }

  /** Mark ornament as having a hat */
  placeHatOnOrnament(ornamentId: number): void {
    const ornament = this.ornaments.get(ornamentId);
    if (!ornament) return;

    ornament.leader.hasHat = true;
    ornament.element.classList.add('has-hat');

    // Celebration animation
    const timeline = gsap.timeline();
    timeline
      .to(ornament.element, {
        scale: ornament.scale * 1.2,
        duration: 0.2,
        ease: 'power2.out'
      })
      .to(ornament.element, {
        scale: ornament.scale,
        duration: 0.4,
        ease: 'elastic.out(1, 0.3)'
      });

    // Slow down the ornament
    ornament.vx *= 0.3;
    ornament.vy *= 0.3;
  }

  /** Get ornament by ID */
  getOrnament(id: number): Ornament | undefined {
    return this.ornaments.get(id);
  }

  /** Get all ornaments */
  getAllOrnaments(): Ornament[] {
    return Array.from(this.ornaments.values());
  }

  /** Get ornament at position */
  getOrnamentAtPosition(pos: Position): Ornament | null {
    for (const ornament of this.ornaments.values()) {
      if (ornament.leader.hasHat) continue;

      const dx = pos.x - (ornament.x + 50);
      const dy = pos.y - (ornament.y + 60);
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 60) {
        return ornament;
      }
    }
    return null;
  }

  /** Set click callback */
  setOnOrnamentClick(callback: (ornament: Ornament) => void): void {
    this.onOrnamentClick = callback;
  }

  /** Clear all ornaments */
  clear(): void {
    this.stop();
    this.ornaments.forEach(ornament => {
      gsap.killTweensOf(ornament.element);
      ornament.element.remove();
    });
    this.ornaments.clear();
  }

  /** Get hat slot element for an ornament */
  getHatSlot(ornamentId: number): HTMLElement | null {
    const ornament = this.ornaments.get(ornamentId);
    return ornament?.element.querySelector('.ornament-hat-slot') || null;
  }
}
