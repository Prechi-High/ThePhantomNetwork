/**
 * Animation Engine
 * 
 * Owns the cinematic timeline:
 * - Animation sequencing
 * - Interruption handling
 * - Priority management
 * - Timeline coordination
 */

import { gameplayEvents, type GameplayEvent } from '../events';
import type { EngineInterface } from '../runtime';

interface AnimationJob {
  id: string;
  type: 'wheel' | 'reveal' | 'tokens' | 'celebration' | 'effect';
  priority: number;
  startTime: number;
  duration: number;
  onComplete?: () => void;
  data?: Record<string, unknown>;
}

interface TimelineState {
  currentAnimation: AnimationJob | null;
  queue: AnimationJob[];
  isPaused: boolean;
  elapsed: number;
}

export class AnimationEngine implements EngineInterface {
  private state: TimelineState = {
    currentAnimation: null,
    queue: [],
    isPaused: false,
    elapsed: 0,
  };

  private animationFrame: number | null = null;
  private lastFrameTime: number = 0;

  constructor() {
    this.setupListeners();
    this.startTickLoop();
  }

  private setupListeners(): void {
    // Spin animation lifecycle
    gameplayEvents.on('SPIN_STARTED', () => {
      this.queueAnimation({
        id: 'wheel-spin',
        type: 'wheel',
        priority: 100,
        duration: 6000,
      });
    });

    gameplayEvents.on('SPIN_POINTER_LOCK', () => {
      this.queueAnimation({
        id: 'wheel-lock',
        type: 'wheel',
        priority: 110,
        duration: 500,
      });
    });

    // Reveal animations
    gameplayEvents.on('REVEAL_STARTED', () => {
      this.queueAnimation({
        id: 'reveal-buildup',
        type: 'reveal',
        priority: 120,
        duration: 500,
      });
    });

    gameplayEvents.on('OUTCOME_REVEAL', (event) => {
      const payload = event.payload as { outcome: string };
      this.queueAnimation({
        id: 'outcome-reveal',
        type: 'reveal',
        priority: 130,
        duration: 2000,
        data: { outcome: payload.outcome },
      });
    });

    // Token animations
    gameplayEvents.on('TOKEN_COLLECTION_STARTED', (event) => {
      const payload = event.payload as { totalAmount: number };
      this.queueAnimation({
        id: 'token-collection',
        type: 'tokens',
        priority: 90,
        duration: 1000,
        data: { totalAmount: payload.totalAmount },
      });
    });

    // Celebration animations
    gameplayEvents.on('OUTCOME_REVEAL', (event) => {
      const payload = event.payload as { outcome: string; tokenDelta?: number };
      if (payload.tokenDelta && payload.tokenDelta > 0) {
        setTimeout(() => {
          this.queueAnimation({
            id: 'celebration',
            type: 'celebration',
            priority: 80,
            duration: 2000,
            data: { outcome: payload.outcome },
          });
        }, 2500);
      }
    });

    // Effect animations
    gameplayEvents.on('EFFECT_TRIGGERED', (event) => {
      const payload = event.payload as { type: string; effectId: string };
      this.queueAnimation({
        id: `effect-${payload.effectId}`,
        type: 'effect',
        priority: 70,
        duration: 1000,
        data: { effectType: payload.type },
      });
    });

    // Pause/Resume
    gameplayEvents.on('GAMEPLAY_PAUSED', () => {
      this.pause();
    });

    gameplayEvents.on('GAMEPLAY_RESUMED', () => {
      this.resume();
    });
  }

  // ============================================================================
  // ANIMATION QUEUE
  // ============================================================================

  queueAnimation(job: Omit<AnimationJob, 'startTime'>): void {
    const fullJob: AnimationJob = {
      ...job,
      startTime: Date.now(),
    };

    // Higher priority = lower number (processed first)
    const insertIndex = this.state.queue.findIndex(
      (existing) => existing.priority < job.priority
    );

    if (insertIndex === -1) {
      this.state.queue.push(fullJob);
    } else {
      this.state.queue.splice(insertIndex, 0, fullJob);
    }

    console.log('[AnimationEngine] Queued animation:', job.id, 'priority:', job.priority);

    // Start processing if not busy
    if (!this.state.currentAnimation) {
      this.processNext();
    }
  }

  private processNext(): void {
    if (this.state.queue.length === 0) {
      this.state.currentAnimation = null;
      return;
    }

    // Get highest priority job
    this.state.queue.sort((a, b) => b.priority - a.priority);
    const next = this.state.queue.shift();
    
    if (!next) return;

    this.state.currentAnimation = next;
    this.state.elapsed = 0;
    this.lastFrameTime = performance.now();

    console.log('[AnimationEngine] Starting animation:', next.id);

    // Auto-complete after duration
    setTimeout(() => {
      this.completeCurrent();
    }, next.duration);
  }

  private completeCurrent(): void {
    if (!this.state.currentAnimation) return;

    const completed = this.state.currentAnimation;
    console.log('[AnimationEngine] Completed animation:', completed.id);

    if (completed.onComplete) {
      completed.onComplete();
    }

    this.state.currentAnimation = null;
    this.processNext();
  }

  // ============================================================================
  // TIMELINE CONTROL
  // ============================================================================

  pause(): void {
    this.state.isPaused = true;
    console.log('[AnimationEngine] Timeline paused');
  }

  resume(): void {
    this.state.isPaused = false;
    this.lastFrameTime = performance.now();
    console.log('[AnimationEngine] Timeline resumed');
  }

  clear(): void {
    this.state.queue = [];
    this.state.currentAnimation = null;
    console.log('[AnimationEngine] Timeline cleared');
  }

  // ============================================================================
  // TICK LOOP
  // ============================================================================

  private startTickLoop(): void {
    const tick = (timestamp: number) => {
      if (!this.state.isPaused && this.state.currentAnimation) {
        const delta = timestamp - this.lastFrameTime;
        this.state.elapsed += delta;
        this.lastFrameTime = timestamp;

        // Emit tick for subscribers
        this.emitTick();
      } else {
        this.lastFrameTime = timestamp;
      }

      this.animationFrame = requestAnimationFrame(tick);
    };

    this.animationFrame = requestAnimationFrame(tick);
  }

  private emitTick(): void {
    if (!this.state.currentAnimation) return;

    const progress = Math.min(
      1,
      this.state.elapsed / this.state.currentAnimation.duration
    );

    // This could emit a TICK event for frame-by-frame subscribers
    // For now, we use requestAnimationFrame directly in components
  }

  // ============================================================================
  // QUERIES
  // ============================================================================

  getCurrentAnimation(): AnimationJob | null {
    return this.state.currentAnimation;
  }

  getQueueLength(): number {
    return this.state.queue.length;
  }

  isAnimating(): boolean {
    return this.state.currentAnimation !== null;
  }

  getProgress(): number {
    if (!this.state.currentAnimation) return 0;
    return Math.min(1, this.state.elapsed / this.state.currentAnimation.duration);
  }

  // ============================================================================
  // UTILITY
  // ============================================================================

  handleEvent(_event: GameplayEvent): void {
    // Events handled via setupListeners
  }

  reset(): void {
    this.clear();
    this.state.isPaused = false;
    this.state.elapsed = 0;
  }

  destroy(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }
}

export const animationEngine = new AnimationEngine();
