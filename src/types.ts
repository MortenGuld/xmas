/** Leadership team member */
export interface Leader {
  id: number;
  name: string;
  initials: string;
  hasHat: boolean;
}

/** Floating ornament containing a leader */
export interface Ornament {
  id: number;
  leader: Leader;
  element: HTMLElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  bobPhase: number;
  bobSpeed: number;
  scale: number;
}

/** Falling hat state */
export interface Hat {
  id: number;
  element: HTMLElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  isPickedUp: boolean;
  isPlaced: boolean;
  isThrown: boolean;
  targetOrnament?: Ornament;
}

/** Game configuration */
export interface GameConfig {
  maxFallingHats: number;
  hatSpawnInterval: number;
  leaderNames: string[];
  ornamentSpeed: number;
  throwSpeed: number;
}

/** Position coordinates */
export interface Position {
  x: number;
  y: number;
}

/** Game state snapshot */
export interface GameStateData {
  hatsPlaced: number;
  totalLeaders: number;
  isComplete: boolean;
  isMuted: boolean;
  hasInteracted: boolean;
}
