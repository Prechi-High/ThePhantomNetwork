/**
 * ExperienceStateMachine — canonical motion states
 */

import type { MotionState, MotionStateChangeEvent, MotionStateListener } from "./types";

export class ExperienceStateMachine {
  private current: MotionState | null = null;
  private listeners = new Set<MotionStateListener>();

  getState(): MotionState | null {
    return this.current;
  }

  transition(state: MotionState, force = false): boolean {
    if (!force && this.current === state) return false;
    const event: MotionStateChangeEvent = {
      from: this.current,
      to: state,
      timestamp: Date.now(),
    };
    this.current = state;
    this.listeners.forEach((fn) => fn(event));
    return true;
  }

  reset(): void {
    this.current = null;
  }

  subscribe(listener: MotionStateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const experienceStateMachine = new ExperienceStateMachine();
