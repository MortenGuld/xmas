import type { Leader, GameStateData, GameConfig } from './types';

/** Default game configuration */
export const DEFAULT_CONFIG: GameConfig = {
  maxFallingHats: 3,
  hatSpawnInterval: 2500,
  leaderNames: ["Arne", "Michael", "Erling", "Kinga", "Lotte", "Morten", "Klaus", "Karolina", "Pawel", "Maksymilian"],
  ornamentSpeed: 0.8,
  throwSpeed: 15
};

/** Extracts initials from a name */
function getInitials(name: string): string {
  return name.charAt(0).toUpperCase();
}

/** Manages the game state */
export class GameState {
  private leaders: Leader[] = [];
  private hatsPlaced: number = 0;
  private isMuted: boolean = false;
  private hasInteracted: boolean = false;
  private config: GameConfig;
  private onChangeCallbacks: Array<(state: GameStateData) => void> = [];

  constructor(config: GameConfig = DEFAULT_CONFIG) {
    this.config = config;
    this.initLeaders();
  }

  /** Initialize leaders from config */
  private initLeaders(): void {
    this.leaders = this.config.leaderNames.map((name, index) => ({
      id: index,
      name,
      initials: getInitials(name),
      hasHat: false
    }));
  }

  /** Get all leaders */
  getLeaders(): Leader[] {
    return [...this.leaders];
  }

  /** Get a specific leader by ID */
  getLeader(id: number): Leader | undefined {
    return this.leaders.find(l => l.id === id);
  }

  /** Place a hat on a leader */
  placeHat(leaderId: number): boolean {
    const leader = this.leaders.find(l => l.id === leaderId);
    if (leader && !leader.hasHat) {
      leader.hasHat = true;
      this.hatsPlaced++;
      this.notifyChange();
      return true;
    }
    return false;
  }

  /** Check if game is complete */
  isComplete(): boolean {
    return this.hatsPlaced >= this.leaders.length;
  }

  /** Get current state snapshot */
  getState(): GameStateData {
    return {
      hatsPlaced: this.hatsPlaced,
      totalLeaders: this.leaders.length,
      isComplete: this.isComplete(),
      isMuted: this.isMuted,
      hasInteracted: this.hasInteracted
    };
  }

  /** Toggle mute state */
  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    this.notifyChange();
    return this.isMuted;
  }

  /** Set mute state */
  setMuted(muted: boolean): void {
    this.isMuted = muted;
    this.notifyChange();
  }

  /** Get mute state */
  getMuted(): boolean {
    return this.isMuted;
  }

  /** Mark that user has interacted */
  setInteracted(): void {
    this.hasInteracted = true;
  }

  /** Check if user has interacted */
  getInteracted(): boolean {
    return this.hasInteracted;
  }

  /** Get config */
  getConfig(): GameConfig {
    return this.config;
  }

  /** Reset game state */
  reset(): void {
    this.hatsPlaced = 0;
    this.leaders.forEach(l => l.hasHat = false);
    this.notifyChange();
  }

  /** Subscribe to state changes */
  onChange(callback: (state: GameStateData) => void): () => void {
    this.onChangeCallbacks.push(callback);
    return () => {
      const index = this.onChangeCallbacks.indexOf(callback);
      if (index > -1) this.onChangeCallbacks.splice(index, 1);
    };
  }

  /** Notify all subscribers of state change */
  private notifyChange(): void {
    const state = this.getState();
    this.onChangeCallbacks.forEach(cb => cb(state));
  }
}
