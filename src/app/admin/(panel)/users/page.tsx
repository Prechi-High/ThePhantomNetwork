"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface UserRow {
  id: string;
  username: string;
  role: string;
  level: number;
  is_banned: boolean;
  wallet_balance_cents: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [query, setQuery] = useState("");

  const load = (q = "") => {
    fetch(`/api/admin/users?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((d) => setUsers(d.users ?? []));
  };

  useEffect(() => {
    load();
  }, []);

  const updateUser = async (userId: string, updates: Record<string, unknown>) => {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...updates }),
    });
    load(query);
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">Users</h1>

      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search username..."
          className="flex-1 rounded-lg border border-phantom-border bg-phantom-bg px-3 py-2"
        />
        <Button size="sm" onClick={() => load(query)}>
          Search
        </Button>
      </div>

      <div className="space-y-3">
        {users.map((u) => (
          <Card key={u.id} className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium">{u.username}</p>
                <p className="text-xs font-mono text-phantom-muted">{u.id}</p>
              </div>
              <div className="flex gap-2">
                <Badge>{u.role}</Badge>
                {u.is_banned && <Badge variant="danger">banned</Badge>}
              </div>
            </div>
            <p className="text-sm text-phantom-muted">
              Level {u.level} · Wallet ${(u.wallet_balance_cents / 100).toFixed(2)}
            </p>
            <div className="flex flex-wrap gap-2">
              {u.role !== "admin" && (
                <Button size="sm" variant="secondary" onClick={() => updateUser(u.id, { role: "admin" })}>
                  Make Admin
                </Button>
              )}
              {u.role !== "camp_owner" && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => updateUser(u.id, { role: "camp_owner" })}
                >
                  Make Camp Owner
                </Button>
              )}
              {u.role !== "player" && (
                <Button size="sm" variant="ghost" onClick={() => updateUser(u.id, { role: "player" })}>
                  Set Player
                </Button>
              )}
              {!u.is_banned ? (
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => updateUser(u.id, { is_banned: true, ban_reason: "Admin action" })}
                >
                  Ban
                </Button>
              ) : (
                <Button size="sm" onClick={() => updateUser(u.id, { is_banned: false, ban_reason: null })}>
                  Unban
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
