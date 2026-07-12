/**
 * Effects Engine
 * 
 * Owns all active effects:
 * - Shields
 * - Cloaks
 * - Insurance
 * - Boosts
 */

import { gameplayEvents, type GameplayEvent } from '../events';
import type { EngineInterface } from '../runtime';

export interface ActiveEffect {
  id: string;
  type: 'shield' | 'cloak' | 'insurance' | 'boost';
  expiresAt: number;
  activatedAt: number;
  metadata?: Record<string, unknown>;
}

export class EffectsEngine implements EngineInterface {
  private effects: Map<string, ActiveEffect> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.setupListeners();
    this.startCleanupLoop();
  }

  private setupListeners(): void {
    gameplayEvents.on('EFFECT_APPLIED', (event) => {
      this.addEffect(event.payload as ActiveEffect);
    });

    gameplayEvents.on('EFFECT_TRIGGERED', (event) => {
      this.triggerEffect(event.payload as { effectId: string });
    });
  }

  // ============================================================================
  // EFFECT MANAGEMENT
  // ============================================================================

  addEffect(effect: ActiveEffect): void {
    this.effects.set(effect.id, effect);
    
    console.log('[EffectsEngine] Effect added:', effect.type, effect.id);
    
    gameplayEvents.emit({
      type: 'EFFECT_APPLIED',
      timestamp: Date.now(),
      source: 'server',
      payload: effect,
    });
  }

  removeEffect(effectId: string): void {
    const effect = this.effects.get(effectId);
    if (effect) {
      this.effects.delete(effectId);
      
      gameplayEvents.emit({
        type: 'EFFECT_EXPIRED',
        timestamp: Date.now(),
        source: 'runtime',
        payload: { effectId, type: effect.type },
      });
    }
  }

  triggerEffect(payload: { effectId: string }): void {
    const effect = this.effects.get(payload.effectId);
    if (!effect) return;

    // Handle effect-specific triggers
    switch (effect.type) {
      case 'shield':
        this.triggerShield(effect);
        break;
      case 'cloak':
        this.triggerCloak(effect);
        break;
      case 'insurance':
        this.triggerInsurance(effect);
        break;
      case 'boost':
        this.triggerBoost(effect);
        break;
    }

    // Remove one-time effects
    if (effect.type === 'shield' || effect.type === 'insurance') {
      this.removeEffect(effect.id);
    }
  }

  // ============================================================================
  // EFFECT TRIGGERS
  // ============================================================================

  private triggerShield(effect: ActiveEffect): void {
    console.log('[EffectsEngine] Shield triggered - blocking steal');
    
    gameplayEvents.emit({
      type: 'EFFECT_TRIGGERED',
      timestamp: Date.now(),
      source: 'runtime',
      payload: {
        effectId: effect.id,
        type: 'shield',
        message: 'Shield blocked a steal attempt!',
      },
    });
  }

  private triggerCloak(effect: ActiveEffect): void {
    console.log('[EffectsEngine] Cloak active - hidden from steal targets');
  }

  private triggerInsurance(effect: ActiveEffect): void {
    console.log('[EffectsEngine] Insurance triggered - protection activated');
    
    gameplayEvents.emit({
      type: 'EFFECT_TRIGGERED',
      timestamp: Date.now(),
      source: 'runtime',
      payload: {
        effectId: effect.id,
        type: 'insurance',
        message: 'Insurance protected against elimination!',
      },
    });
  }

  private triggerBoost(effect: ActiveEffect): void {
    console.log('[EffectsEngine] Boost active - increased steal output');
  }

  // ============================================================================
  // QUERIES
  // ============================================================================

  getActiveEffects(): ActiveEffect[] {
    return Array.from(this.effects.values());
  }

  getEffectsByType(type: ActiveEffect['type']): ActiveEffect[] {
    return this.getActiveEffects().filter(e => e.type === type);
  }

  hasEffect(effectId: string): boolean {
    return this.effects.has(effectId);
  }

  hasShield(): boolean {
    return this.getEffectsByType('shield').length > 0;
  }

  hasCloak(): boolean {
    return this.getEffectsByType('cloak').some(e => e.expiresAt > Date.now());
  }

  hasInsurance(): boolean {
    return this.getEffectsByType('insurance').length > 0;
  }

  getBoostMultiplier(): number {
    const boosts = this.getEffectsByType('boost');
    return boosts.length > 0 ? 1.5 : 1.0;
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  private startCleanupLoop(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      this.effects.forEach((effect, id) => {
        if (effect.expiresAt <= now) {
          this.removeEffect(id);
        }
      });
    }, 1000);
  }

  reset(): void {
    this.effects.clear();
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  destroy(): void {
    this.reset();
  }
}

export const effectsEngine = new EffectsEngine();
