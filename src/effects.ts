import gsap from 'gsap';
import confetti from 'canvas-confetti';

/** Christmas lights string decoration */
export function createChristmasLights(container: HTMLElement): void {
  const lightsTop = document.createElement('div');
  lightsTop.className = 'christmas-lights christmas-lights-top';

  const colors = ['#ff0000', '#00ff00', '#ffff00', '#00bfff', '#ff69b4', '#ffa500'];
  const numLights = Math.floor(window.innerWidth / 40);

  for (let i = 0; i < numLights; i++) {
    const light = document.createElement('div');
    light.className = 'light-bulb';
    light.style.setProperty('--color', colors[i % colors.length]);
    light.style.setProperty('--delay', `${i * 0.1}s`);
    lightsTop.appendChild(light);
  }

  container.appendChild(lightsTop);
}

/** Create twinkling stars in the background */
export function createStars(container: HTMLElement, count: number = 50): void {
  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.cssText = `
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 60}%;
      --twinkle-delay: ${Math.random() * 3}s;
      --twinkle-duration: ${2 + Math.random() * 2}s;
      --star-size: ${2 + Math.random() * 3}px;
    `;
    container.appendChild(star);
  }
}

/** Create floating sparkles effect */
export function createSparkle(x: number, y: number, color: string = '#ffd700'): void {
  const sparkle = document.createElement('div');
  sparkle.className = 'sparkle-particle';
  sparkle.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y}px;
    width: 10px;
    height: 10px;
    background: ${color};
    border-radius: 50%;
    pointer-events: none;
    z-index: 1000;
  `;
  document.body.appendChild(sparkle);

  const angle = Math.random() * Math.PI * 2;
  const distance = 30 + Math.random() * 50;

  gsap.to(sparkle, {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance - 20,
    opacity: 0,
    scale: 0,
    duration: 0.6,
    ease: 'power2.out',
    onComplete: () => sparkle.remove()
  });
}

/** Create burst of sparkles */
export function createSparkleBurst(x: number, y: number, count: number = 12): void {
  const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#fff', '#ff69b4'];
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      createSparkle(
        x + (Math.random() - 0.5) * 30,
        y + (Math.random() - 0.5) * 30,
        colors[i % colors.length]
      );
    }, i * 20);
  }
}

/** Magic dust trail effect */
export function createMagicDust(container: HTMLElement): () => void {
  let lastX = 0;
  let lastY = 0;

  const createDust = (x: number, y: number) => {
    const dust = document.createElement('div');
    dust.className = 'magic-dust';
    dust.style.cssText = `
      left: ${x}px;
      top: ${y}px;
    `;
    container.appendChild(dust);

    gsap.to(dust, {
      y: -30,
      opacity: 0,
      scale: 0,
      duration: 0.8,
      ease: 'power2.out',
      onComplete: () => dust.remove()
    });
  };

  const onMove = (e: MouseEvent) => {
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 20) {
      createDust(e.clientX, e.clientY);
      lastX = e.clientX;
      lastY = e.clientY;
    }
  };

  document.addEventListener('mousemove', onMove);

  return () => {
    document.removeEventListener('mousemove', onMove);
  };
}

/** Victory confetti celebration */
export function celebrateVictory(): void {
  const colors = ['#c41e3a', '#00843d', '#ffd700', '#ffffff', '#ff69b4'];
  const duration = 5000;
  const end = Date.now() + duration;

  // Initial big burst
  confetti({
    particleCount: 200,
    spread: 120,
    origin: { y: 0.5 },
    colors,
    startVelocity: 50
  });

  // Side cannons
  const frame = () => {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors,
      startVelocity: 40
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors,
      startVelocity: 40
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  setTimeout(frame, 300);

  // Extra bursts
  [1000, 2000, 3000].forEach(delay => {
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { x: Math.random(), y: Math.random() * 0.5 + 0.2 },
        colors
      });
    }, delay);
  });
}

/** Create aurora/northern lights effect */
export function createAurora(container: HTMLElement): void {
  const aurora = document.createElement('div');
  aurora.className = 'aurora';
  container.appendChild(aurora);
}
