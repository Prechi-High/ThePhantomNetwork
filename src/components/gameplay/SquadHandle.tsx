"use client";
import { Users, ChevronUp, ChevronDown } from "lucide-react";
import { AnimatedAvatar } from "@/components/avatar";
import type { ProfileSpriteState } from "@/lib/assets/types";

interface SquadMember {
  user_id: string;
  session_tokens: number;
  is_eliminated: boolean;
  is_revivable?: boolean;
  profiles?: { username: string } | null;
}

interface Squad {
  id: string;
  name: string;
  squad_tokens: number;
  is_permanent?: boolean;
}

interface SquadHandleProps {
  squadMembers: SquadMember[];
  topSquads: Squad[];
  showSquad: boolean;
  setShowSquad: (v: boolean) => void;
}

export function SquadHandle({
  squadMembers,
  topSquads,
  showSquad,
  setShowSquad,
}: SquadHandleProps) {
  const highestTokens = Math.max(...squadMembers.map((p) => p.session_tokens), 0);

  return (
    <aside className="flex-1 flex flex-col min-w-0">
      <div className="flex justify-between items-center mb-1.5">
        <p className="text-[8px] font-bold uppercase tracking-wider text-phantom-purple-bright">SQUADS</p>
        <button onClick={() => setShowSquad(!showSquad)} className="text-phantom-muted">
          {showSquad ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {showSquad && (
        <div className="flex-1 overflow-y-auto space-y-2">
          <div>
            <p className="text-[7px] uppercase tracking-wider text-phantom-muted mb-1">YOUR SQUAD</p>
            <ul className="space-y-1.5">
              {squadMembers.slice(0, 2).map((m) => {
                const name = m.profiles?.username ?? "Player";
                const eliminated = m.is_eliminated;
                const revivable = m.is_revivable;
                const winning = m.session_tokens === highestTokens;

                const states: ProfileSpriteState[] = [];
                if (eliminated) states.push("ELIMINATED");
                if (revivable) states.push("REVIVING");
                if (winning) states.push("WINNING");
                if (states.length === 0) states.push("DEFAULT");

                return (
                  <li
                    key={m.user_id}
                    className={`flex items-center gap-1.5 glass rounded-lg px-1.5 py-1 ${
                      eliminated ? "border-red-900/40" : "border-phantom-border/60"
                    }`}
                  >
                    <AnimatedAvatar
                      states={states}
                      size="sm"
                      tokens={eliminated ? undefined : m.session_tokens}
                      online={!eliminated}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[8px] font-medium text-white">@{name}</p>
                      <p className="text-[7px] text-phantom-muted">
                        {eliminated ? "Elim" : `${m.session_tokens}`}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <p className="text-[7px] uppercase tracking-wider text-phantom-muted mb-1">TOP SQUADS</p>
            <ul className="space-y-1.5">
              {topSquads.slice(0, 2).map((squad, index) => (
                <li
                  key={squad.id}
                  className="flex items-center justify-between glass rounded-lg px-1.5 py-1 border border-phantom-border/60"
                >
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] font-mono text-phantom-muted">{index + 1}</span>
                    <p className="text-[8px] font-semibold text-white truncate">{squad.name}</p>
                  </div>
                  <span className="text-[7px] font-mono text-yellow-500">
                    {Number(squad.squad_tokens).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </aside>
  );
}
