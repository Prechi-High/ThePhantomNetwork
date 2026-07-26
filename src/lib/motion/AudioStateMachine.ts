/**
 * AudioStateMachine — auto-plays audio profiles on state changes
 */

import { AUDIO_STATE_PROFILES } from "./AudioRegistry";
import { audioManager } from "./AudioManager";
import type { MotionState, MotionStateChangeEvent } from "./types";

export class AudioStateMachine {
  private bound = false;

  bind(onStateChange: (listener: (event: MotionStateChangeEvent) => void) => () => void): void {
    if (this.bound) return;
    this.bound = true;
    onStateChange((event) => {
      if (event.from) this.onExit(event.from);
      this.onEnter(event.to);
    });
  }

  onEnter(state: MotionState): void {
    const profile = AUDIO_STATE_PROFILES[state];
    if (!profile) return;
    for (const action of profile.enter) {
      if ("play" in action) {
        audioManager.play(action.play, action.volume);
      } else if ("stop" in action) {
        audioManager.stop(action.stop, action.fadeOut);
      }
    }
  }

  onExit(state: MotionState): void {
    const profile = AUDIO_STATE_PROFILES[state];
    if (!profile) return;
    for (const action of profile.exit) {
      audioManager.stop(action.stop, action.fadeOut);
    }
  }
}

export const audioStateMachine = new AudioStateMachine();
