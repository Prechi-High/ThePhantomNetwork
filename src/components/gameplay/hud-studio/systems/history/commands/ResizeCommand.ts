/**
 * Resize Command
 * 
 * Command for resizing a component.
 */

import type { Command } from '../types';
import type { NormalizedSize } from '../../state/slices/componentsSlice';

export class ResizeCommand implements Command {
  description: string;

  constructor(
    private componentId: string,
    private oldSize: NormalizedSize,
    private newSize: NormalizedSize,
    private updateFn: (id: string, size: NormalizedSize) => void
  ) {
    this.description = `Resize ${componentId}`;
  }

  execute(): void {
    this.updateFn(this.componentId, this.newSize);
  }

  undo(): void {
    this.updateFn(this.componentId, this.oldSize);
  }
}
