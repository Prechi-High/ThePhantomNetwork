"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { AVATARS } from "@/types/gameplay";

interface Member {
  id: string;
  username: string;
  avatar_id: string;
  level: number;
  prestige_score: number;
  sessionsPlayed: number;
}

export default function CampMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    fetch("/api/camp-owner/members")
      .then((r) => r.json())
      .then((d) => setMembers(d.members ?? []));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">Members</h1>
      <div className="space-y-2">
        {members.map((m) => {
          const avatar = AVATARS.find((a) => a.id === m.avatar_id);
          return (
            <Card key={m.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{avatar?.emoji ?? "🌑"}</span>
                <div>
                  <p className="font-medium">{m.username}</p>
                  <p className="text-xs text-phantom-muted">
                    Level {m.level} · Prestige {m.prestige_score}
                  </p>
                </div>
              </div>
              <p className="text-sm text-phantom-muted">{m.sessionsPlayed} sessions</p>
            </Card>
          );
        })}
        {!members.length && (
          <Card>
            <p className="text-phantom-muted">No members yet. Share your referral link to recruit.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
