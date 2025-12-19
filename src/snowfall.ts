/** Snowfall effect using CSS animations */
export class Snowfall {
  private container: HTMLElement;
  private snowflakes: HTMLElement[] = [];
  private maxSnowflakes: number = 50;
  private spawnInterval: number | null = null;
  private isRunning: boolean = false;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  /** Start the snowfall */
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    // Spawn initial batch
    for (let i = 0; i < 20; i++) {
      setTimeout(() => this.createSnowflake(), i * 100);
    }

    // Continue spawning
    this.spawnInterval = window.setInterval(() => {
      if (this.snowflakes.length < this.maxSnowflakes) {
        this.createSnowflake();
      }
    }, 300);
  }

  /** Stop the snowfall */
  stop(): void {
    this.isRunning = false;
    if (this.spawnInterval) {
      clearInterval(this.spawnInterval);
      this.spawnInterval = null;
    }
  }

  /** Create a single snowflake */
  private createSnowflake(): void {
    const snowflake = document.createElement('div');
    snowflake.className = 'snowflake';
    snowflake.setAttribute('aria-hidden', 'true');

    // Random properties
    const size = 3 + Math.random() * 6;
    const startX = Math.random() * 100;
    const duration = 8 + Math.random() * 8;
    const delay = Math.random() * 2;
    const drift = -20 + Math.random() * 40;

    snowflake.style.cssText = `
      left: ${startX}%;
      width: ${size}px;
      height: ${size}px;
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
      --drift: ${drift}px;
      opacity: ${0.4 + Math.random() * 0.6};
    `;

    this.container.appendChild(snowflake);
    this.snowflakes.push(snowflake);

    // Remove after animation
    setTimeout(() => {
      this.removeSnowflake(snowflake);
    }, (duration + delay) * 1000);
  }

  /** Remove a snowflake */
  private removeSnowflake(snowflake: HTMLElement): void {
    const index = this.snowflakes.indexOf(snowflake);
    if (index > -1) {
      this.snowflakes.splice(index, 1);
    }
    snowflake.remove();
  }

  /** Clear all snowflakes */
  clear(): void {
    this.stop();
    this.snowflakes.forEach(s => s.remove());
    this.snowflakes = [];
  }
}
