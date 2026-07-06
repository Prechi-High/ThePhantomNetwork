/**
 * Component Registry
 * 
 * Central registry for all HUD components that can be edited in the studio.
 * Components must register themselves to appear in the editor.
 */

import type { HUDComponentMetadata, ComponentCategory } from './types';

class ComponentRegistry {
  private components = new Map<string, HUDComponentMetadata>();

  /**
   * Register a HUD component for editing
   */
  register(metadata: HUDComponentMetadata): void {
    if (this.components.has(metadata.id)) {
      console.warn(`[HUD Studio] Component "${metadata.id}" already registered`);
      return;
    }

    this.components.set(metadata.id, metadata);
    console.log(`[HUD Studio] Registered component: ${metadata.displayName} (${metadata.id})`);
  }

  /**
   * Unregister a component
   */
  unregister(id: string): void {
    const removed = this.components.delete(id);
    if (removed) {
      console.log(`[HUD Studio] Unregistered component: ${id}`);
    }
  }

  /**
   * Get component metadata by ID
   */
  get(id: string): HUDComponentMetadata | undefined {
    return this.components.get(id);
  }

  /**
   * Get all registered components
   */
  getAll(): HUDComponentMetadata[] {
    return Array.from(this.components.values());
  }

  /**
   * Get components by category
   */
  getByCategory(category: ComponentCategory): HUDComponentMetadata[] {
    return this.getAll().filter(c => c.category === category);
  }

  /**
   * Check if component is registered
   */
  has(id: string): boolean {
    return this.components.has(id);
  }

  /**
   * Get all categories that have registered components
   */
  getCategories(): ComponentCategory[] {
    const categories = new Set<ComponentCategory>();
    this.getAll().forEach(c => categories.add(c.category));
    return Array.from(categories);
  }

  /**
   * Clear all registrations (for testing)
   */
  clear(): void {
    this.components.clear();
  }
}

// Singleton instance
export const componentRegistry = new ComponentRegistry();
