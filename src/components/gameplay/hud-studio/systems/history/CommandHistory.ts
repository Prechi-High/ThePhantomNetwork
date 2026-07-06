/**
 * Command History Manager
 * 
 * Manages undo/redo functionality using the command pattern.
 */

import type { Command } from './types';

export class CommandHistory {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];
  private maxSize = 100;

  execute(command: Command): void {
    command.execute();
    this.undoStack.push(command);
    this.redoStack = []; // Clear redo stack on new action

    if (this.undoStack.length > this.maxSize) {
      this.undoStack.shift();
    }

    console.log(`[HUD Studio] Executed: ${command.description}`);
  }

  undo(): void {
    const command = this.undoStack.pop();
    if (command) {
      command.undo();
      this.redoStack.push(command);
      console.log(`[HUD Studio] Undone: ${command.description}`);
    }
  }

  redo(): void {
    const command = this.redoStack.pop();
    if (command) {
      command.execute();
      this.undoStack.push(command);
      console.log(`[HUD Studio] Redone: ${command.description}`);
    }
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
    console.log('[HUD Studio] History cleared');
  }

  getHistory(): Command[] {
    return [...this.undoStack];
  }

  getHistorySize(): number {
    return this.undoStack.length;
  }
}

// Singleton instance
export const commandHistory = new CommandHistory();
