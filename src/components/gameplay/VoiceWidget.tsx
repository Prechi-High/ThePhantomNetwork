"use client";
import { Volume2 } from "lucide-react";

export function VoiceWidget() {
  return (
    <div className="glass rounded-full border border-phantom-border/60 px-2.5 py-1.5 sm:px-3 sm:py-2">
      <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
    </div>
  );
}
