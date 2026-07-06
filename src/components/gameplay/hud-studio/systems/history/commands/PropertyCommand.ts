/**
 * Property Command
 * 
 * Command for changing a component property.
 */

import type { Command } from '../types';

export class PropertyCommand implements Command {
  description: string;

  constructor(
    private componentId: string,
    private property: string,
    private oldValue: unknown,
    private newValue: unknown,
    private updateFn: (id: string, prop: string, value: unknown) => void
  ) {
    this.description = `Change ${property} of ${componentId}`;
  }

  execute(): void {
    this.updateFn(this.componentId, this.property, this.newValue);
  }

  undo(): void {
    this.updateFn(this.componentId, this.property, this.oldValue);
  }
}
