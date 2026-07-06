/**
 * Move Command
 * 
 * Command for moving a component's position.
 */

import type { Command } from '../types';
import type { NormalizedPosition } from '../../state/slices/componentsSlice';

export class MoveCommand implements Command {
  description: string;

  constructor(
    private componentId: string,
    private oldPosition: NormalizedPosition,
    private newPosition: NormalizedPosition,
    private updateFn: (id: string, pos: NormalizedPosition) => void
  ) {
    this.description = `Move ${componentId}`;
  }

  execute(): void {
    this.updateFn(this.componentId, this.newPosition);
  }

  undo(): void {
    this.updateFn(this.componentId, this.oldPosition);
  }
}
