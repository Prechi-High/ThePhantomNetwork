/**
 * App-level motion events (screens, UI, countdown, victory)
 */

export type AppEventType =
  | "SCREEN_ENTER"
  | "SCREEN_EXIT"
  | "BUTTON_PRESS"
  | "CARD_HOVER"
  | "COUNTDOWN_TICK"
  | "COUNTDOWN_GO"
  | "PURCHASE_COMPLETE"
  | "VICTORY";

export interface AppEvent {
  type: AppEventType;
  timestamp: number;
  payload?: unknown;
  source: "player" | "system";
}

type AppEventHandler = (event: AppEvent) => void;

class AppEventBus {
  private listeners = new Map<AppEventType, Set<AppEventHandler>>();

  on(type: AppEventType, handler: AppEventHandler): () => void {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(handler);
    return () => this.listeners.get(type)?.delete(handler);
  }

  emit(event: AppEvent): void {
    this.listeners.get(event.type)?.forEach((h) => h(event));
  }
}

export const appEvents = new AppEventBus();
