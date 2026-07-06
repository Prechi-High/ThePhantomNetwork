/**
 * Resize Command
 * 
 * Command for resizing a component (may also update position when resizing from top/left).
 */

import type { Command } from '../types';
import type { NormalizedSize, NormalizedPosition } from '../../state/slices/componentsSlice';

export class ResizeCommand implements Command {
  description: string;

  constructor(
    private componentId: string,
    private oldPosition: NormalizedPosition,
    private oldSize: NormalizedSize,
    private newPosition: NormalizedPosition,
    private newSize: NormalizedSize,
    private updateFn: (id: string, position: NormalizedPosition, size: NormalizedSize) => void
  ) {
    this.description = `Resize ${componentId}`;
  }

  execute(): void {
    this.updateFn(this.componentId, this.newPosition, this.newSize);
  }

  undo(): void {
    this.updateFn(this.componentId, this.oldPosition, this.oldSize);
  }
}
