"use client";
import { Zap, Shield, UserMinus, Umbrella } from "lucide-react";

interface Skill {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  border: string;
  ready: boolean;
  cooldown?: string;
}

const defaultSkills: Skill[] = [
  { id: "steal", name: "Steal Boost", icon: Zap, color: "text-purple-500", bg: "bg-purple-900/30", border: "border-purple-500/50", ready: true },
  { id: "shield", name: "Shield", icon: Shield, color: "text-cyan-500", bg: "bg-cyan-900/30", border: "border-cyan-500/50", ready: true },
  { id: "cloak", name: "Cloak", icon: UserMinus, color: "text-purple-400", bg: "bg-purple-900/30", border: "border-purple-400/50", ready: false, cooldown: "15s" },
  { id: "insurance", name: "Insurance", icon: Umbrella, color: "text-yellow-500", bg: "bg-yellow-900/30", border: "border-yellow-500/50", ready: true },
];

interface SkillDockProps {
  skills?: Skill[];
}

export function SkillDock({ skills = defaultSkills }: SkillDockProps) {
  return (
    <div className="flex items-center justify-center gap-2.5 sm:gap-3 mb-4 sm:mb-6">
      {skills.map((skill) => (
        <div key={skill.id} className="flex flex-col items-center">
          <button
            className={`h-12 w-12 sm:h-14 sm:w-14 rounded-2xl border-2 flex items-center justify-center ${skill.bg} ${skill.border} ${
              skill.ready ? "hover:scale-105 transition-transform" : "opacity-50 cursor-not-allowed"
            }`}
            disabled={!skill.ready}
          >
            <skill.icon className={`w-5.5 h-5.5 sm:w-7 sm:h-7 ${skill.color}`} />
          </button>
          {skill.cooldown && (
            <span className="text-[8px] sm:text-[9px] text-phantom-muted mt-1">{skill.cooldown}</span>
          )}
          <span className="text-[7px] sm:text-[8px] text-phantom-muted uppercase mt-0.5">{skill.name}</span>
        </div>
      ))}
    </div>
  );
}
