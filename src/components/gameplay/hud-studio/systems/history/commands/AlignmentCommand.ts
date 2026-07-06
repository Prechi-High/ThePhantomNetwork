/**
 * AlignmentCommand - Command for alignment operations
 * 
 * Handles undo/redo for alignment, distribution, and size matching.
 */

import type { Command } from '../types';
import type { ComponentInstance, NormalizedPosition, NormalizedSize } from '../../state/slices/componentsSlice';
import type { AlignmentResult } from '../../alignment/types';

interface ComponentState {
  id: string;
  position: NormalizedPosition;
  size: NormalizedSize;
}

export class AlignmentCommand implements Command {
  description: string;
  private previousStates: ComponentState[];
  private newStates: ComponentState[];

  constructor(
    description: string,
    components: ComponentInstance[],
    alignmentResults: AlignmentResult[],
    private updateFn: (id: string, updates: Partial<ComponentInstance>) => void
  ) {
    this.description = description;

    // Store previous states
    this.previousStates = components.map(c => ({
      id: c.id,
      position: { ...c.position },
      size: { ...c.size },
    }));

    // Store new states
    this.newStates = alignmentResults.map(result => ({
      id: result.componentId,
      position: { ...result.position },
      size: result.size ? { ...result.size } : 
        components.find(c => c.id === result.componentId)!.size,
    }));
  }

  execute(): void {
    this.newStates.forEach(state => {
      this.updateFn(state.id, {
        position: state.position,
        size: state.size,
      });
    });
  }

  undo(): void {
    this.previousStates.forEach(state => {
      this.updateFn(state.id, {
        position: state.position,
        size: state.size,
      });
    });
  }
}
