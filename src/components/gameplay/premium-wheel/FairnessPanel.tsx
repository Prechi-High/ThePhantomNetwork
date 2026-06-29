"use client";

import { useState } from "react";
import type { SpinOutcome } from "@/types/gameplay";

export interface FairnessPanelProps {
  spinId: string;
  winningSector: SpinOutcome;
  hashedServerSeed: string;
  clientSeed: string;
  nonce: number;
  randomFloat: number;
  winningIndex: number;
  timestamp: number;
}

export function FairnessPanel(props: FairnessPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-8 w-full max-w-md mx-auto">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-2 px-4 text-sm text-gray-400 hover:text-gray-300 flex items-center justify-center gap-2 border-t border-phantom-border/50 hover:border-phantom-border transition-all"
      >
        <span className="text-xs uppercase tracking-wider">Fairness Proof</span>
        <span className="text-xs">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="mt-4 p-4 bg-phantom-bg/80 border border-phantom-border rounded-lg text-xs font-mono">
          <div className="grid grid-cols-1 gap-3">
            <div>
              <span className="text-phantom-gold">Spin ID:</span>
              <span className="text-gray-300 ml-2">{props.spinId}</span>
            </div>
            <div>
              <span className="text-phantom-gold">Winning Sector:</span>
              <span className="text-gray-300 ml-2">{props.winningSector}</span>
            </div>
            <div>
              <span className="text-phantom-gold">Winning Index:</span>
              <span className="text-gray-300 ml-2">{props.winningIndex}</span>
            </div>
            <div>
              <span className="text-phantom-gold">Random Float:</span>
              <span className="text-gray-300 ml-2">{props.randomFloat.toFixed(16)}</span>
            </div>
            <div>
              <span className="text-phantom-gold">Nonce:</span>
              <span className="text-gray-300 ml-2">{props.nonce}</span>
            </div>
            <div>
              <span className="text-phantom-gold">Client Seed:</span>
              <span className="text-gray-300 ml-2 break-all">{props.clientSeed}</span>
            </div>
            <div>
              <span className="text-phantom-gold">Hashed Server Seed:</span>
              <span className="text-gray-300 ml-2 break-all">{props.hashedServerSeed}</span>
            </div>
            <div>
              <span className="text-phantom-gold">Timestamp:</span>
              <span className="text-gray-300 ml-2">{new Date(props.timestamp).toLocaleString()}</span>
            </div>
            <div className="pt-2 border-t border-phantom-border/50">
              <span className="text-phantom-gold text-xs">
              Note: Server Seed is hidden until game session ends to prevent tampering
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
