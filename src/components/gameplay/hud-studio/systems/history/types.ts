/**
 * History System Types
 * 
 * Command pattern interfaces for undo/redo functionality.
 */

export interface Command {
  execute(): void;
  undo(): void;
  description: string;
}
