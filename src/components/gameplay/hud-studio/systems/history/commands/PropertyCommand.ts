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
    private oldValue: any,
    private newValue: any,
    private updateFn: (id: string, prop: string, value: any) => void
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
