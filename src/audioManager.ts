import { Howl } from 'howler';

/** Simple audio manager using embedded base64 sounds */
export class AudioManager {
  private pickupSound: Howl | null = null;
  private placeSound: Howl | null = null;
  private victorySound: Howl | null = null;
  private isMuted: boolean = true;
  private isInitialized: boolean = false;

  constructor() {
    // Sounds will be initialized on first user interaction
  }

  /** Initialize sounds (call after user interaction) */
  init(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Simple synthesized sounds using data URLs
    // These are tiny placeholder sounds - in production you'd use real audio files
    this.pickupSound = new Howl({
      src: ['data:audio/wav;base64,UklGRl4BAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YToBAAB/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/gICAgICAgH5+fn5+fn5/f39/gICAgICAgH9/f39/f39+fn5+fn5+f39/f4CAgICAgIB/f39/f39/fn5+fn5+fn9/f3+AgICAgICAgICAgH9/f35+fn5+fn5/f3+AgICAgICAgH9/f39/f39+fn5+f39/f4CAgICAgIB/f39/f39/fn5+fn5+fn9/f3+AgICAgICAgICAgH9/f35+fn5+fn5/f3+AgICAgICAf39/f39/f39+fn5+f39/gICAgICAgIB/f39/f39/fn5+fn5+fn9/f4CAgICAgICAgA=='],
      volume: 0.3
    });

    this.placeSound = new Howl({
      src: ['data:audio/wav;base64,UklGRooBAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YWYBAAB/f39/f39/f39/f4CAgICAgICBgYGBgYGBgoKCgoKCgoODg4ODg4OEhISEhISEhYWFhYWFhYaGhoaGhoaHh4eHh4eHiIiIiIiIiImJiYmJiYmJiYmJiYmJiYiIiIiIiIiHh4eHh4eHhoaGhoaGhoWFhYWFhYWEhISEhISEg4ODg4ODg4KCgoKCgoKBgYGBgYGBgICAgICAgH9/f39/f39+fn5+fn5+fX19fX19fXx8fHx8fHx7e3t7e3t7enp6enp6enl5eXl5eXl4eHh4eHh4d3d3d3d3d3Z2dnZ2dnZ1dXV1dXV1dXV1dXV1dXV2dnZ2dnZ2d3d3d3d3d3h4eHh4eHh5eXl5eXl5enp6enp6ent7e3t7e3t8fHx8fHx8fX19fX19fX5+fn5+fn5/f39/f39/gICAgICAgA=='],
      volume: 0.4
    });

    this.victorySound = new Howl({
      src: ['data:audio/wav;base64,UklGRsICAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YZ4CAABiYmJiY2NjY2RkZGRlZWVlZmZmZmdnZ2doaGhoaWlpaWpqampra2trbGxsbG1tbW1ubm5ub29vb3BwcHBxcXFxcnJycnNzc3N0dHR0dXV1dXZ2dnZ3d3d3eHh4eHl5eXl6enp6e3t7e3x8fHx9fX19fn5+fn9/f3+AgICAgYGBgYKCgoKDg4ODhISEhIWFhYWGhoaGh4eHh4iIiIiJiYmJioqKiouLi4uMjIyMjY2NjY6Ojo6Pj4+PkJCQkJGRkZGSkpKSk5OTk5SUlJSVlZWVlpaWlpeXl5eYmJiYmZmZmZqampqbm5ubnJycnJ2dnZ2enp6en5+fn6CgoKChoaGhoqKioqOjo6OkpKSkpaWlpaampqanp6enqKioqKmpqamqqqqrq6urrKysrK2tra2urq6ur6+vr7CwsLCxsbGxsrKysrOzs7O0tLS0tbW1tba2tra3t7e3uLi4uLm5ubm6urq6u7u7u7y8vLy9vb29vr6+vr+/v7/AwMDAwcHBwcLCwsLDw8PDxMTExMXFxcXGxsbGx8fHx8jIyMjJycnJysrKysvLy8vMzMzMzc3Nzc7Ozs7Pz8/P0NDQ0NHR0dHS0tLS09PT09TU1NTV1dXV1tbW1tfX19fY2NjY2dnZ2dra2trb29vb3Nzc3N3d3d3e3t7e39/f3+Dg4ODh4eHh4uLi4uPj4+Pk5OTk5eXl5ebm5ubn5+fn6Ojo6Onp6enq6urq6+vr6+zs7Ozt7e3t7u7u7u/v7+/w8PDw8fHx8fLy8vLz8/Pz9PT09PX19fX29vb29/f39/j4+Pj5+fn5+vr6+vv7+/v8/Pz8/f39/f7+/v7///8='],
      volume: 0.5
    });
  }

  /** Set mute state */
  setMuted(muted: boolean): void {
    this.isMuted = muted;
  }

  /** Play pickup sound */
  playPickup(): void {
    if (!this.isMuted && this.pickupSound) {
      this.pickupSound.play();
    }
  }

  /** Play place sound */
  playPlace(): void {
    if (!this.isMuted && this.placeSound) {
      this.placeSound.play();
    }
  }

  /** Play victory sound */
  playVictory(): void {
    if (!this.isMuted && this.victorySound) {
      this.victorySound.play();
    }
  }
}
