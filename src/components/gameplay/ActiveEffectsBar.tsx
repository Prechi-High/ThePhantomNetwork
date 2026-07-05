"use client";

interface ActiveEffect {
  id: string;
  name: string;
  icon: string;
  duration: string;
}

const defaultEffects: ActiveEffect[] = [
  { id: "shield", name: "Shield", icon: "🛡️", duration: "12s" },
];

interface ActiveEffectsBarProps {
  effects?: ActiveEffect[];
}

export function ActiveEffectsBar({ effects = defaultEffects }: ActiveEffectsBarProps) {
  if (effects.length === 0) return null;

  return (
    <div className="flex items-center gap-2 mb-2">
      {effects.map((effect) => (
        <div key={effect.id} className="flex items-center gap-1 glass rounded-lg px-2 py-1 border border-cyan-500/30">
          <span className="text-lg">{effect.icon}</span>
          <p className="text-[8px] text-cyan-400">{effect.name}</p>
          <span className="text-[7px] text-phantom-muted">{effect.duration}</span>
        </div>
      ))}
    </div>
  );
}
