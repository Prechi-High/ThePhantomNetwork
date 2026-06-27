"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SessionCountdown } from "@/components/session/SessionCountdown";
import { useSessionPoll } from "@/hooks/useSessionPoll";
import { reportClientError } from "@/lib/monitoring/client-report";

interface SessionDetailResponse {
  session?: {
    title: string;
    status: string;
    starts_at: string;
    entry_fee_cents: number;
    registration_closes_at: string;
  };
  poolCents?: number;
  error?: string;
}

export default function SessionDetailPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();
  const [data, setData] = useState<SessionDetailResponse | null>(null);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");

  const loadSession = async (silent = false) => {
    if (!sessionId) return;
    if (!silent) setLoading(true);
    setLoadError("");

    try {
      const res = await fetch(`/api/sessions/${sessionId}`, { credentials: "same-origin" });
      const json = (await res.json()) as SessionDetailResponse;

      if (!res.ok || !json.session) {
        const msg = json.error ?? "Session not found";
        setLoadError(msg);
        reportClientError({
          area: "session",
          message: msg,
          context: { sessionId, statusCode: res.status },
          url: `/sessions/${sessionId}`,
        });
        setData(null);
        return;
      }

      setData(json);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load session";
      setLoadError(msg);
      reportClientError({
        area: "session",
        message: msg,
        stack: err instanceof Error ? err.stack : undefined,
        context: { sessionId },
        url: `/sessions/${sessionId}`,
      });
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  useSessionPoll(() => loadSession(true), 8000, Boolean(sessionId));

  const handleJoin = async () => {
    setJoining(true);
    setJoinError("");

    try {
      const res = await fetch(`/api/sessions/${sessionId}/join`, {
        method: "POST",
        credentials: "same-origin",
      });
      const json = await res.json();

      if (!res.ok) {
        const msg = json.error ?? "Failed to join session";
        setJoinError(msg);
        reportClientError({
          area: "session",
          message: msg,
          context: { sessionId, statusCode: res.status, action: "join" },
        });
        return;
      }

      await loadSession();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Join failed";
      setJoinError(msg);
      reportClientError({ area: "session", message: msg, context: { sessionId, action: "join" } });
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return <p className="text-phantom-muted">Loading session...</p>;
  }

  if (loadError || !data?.session) {
    return (
      <Card className="space-y-3">
        <p className="text-phantom-danger">{loadError || "Session unavailable"}</p>
        <Button variant="secondary" onClick={() => router.push("/sessions")}>
          Back to Sessions
        </Button>
      </Card>
    );
  }

  const s = data.session;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">{s.title}</h1>

      <SessionCountdown
        startsAt={s.starts_at}
        registrationClosesAt={s.registration_closes_at}
        status={s.status}
        alwaysShow
        className="rounded-lg border border-phantom-border bg-phantom-surface/50 py-4"
      />

      <Card glow>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-phantom-muted">Status</span>
            <Badge>{s.status}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-phantom-muted">Starts</span>
            <span>{new Date(s.starts_at).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-phantom-muted">Registration closes</span>
            <span>{new Date(s.registration_closes_at).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-phantom-muted">Entry Fee</span>
            <span className="text-phantom-gold">${(s.entry_fee_cents / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-phantom-muted">Pool</span>
            <span className="font-mono text-lg text-phantom-gold">
              ${((data.poolCents ?? 0) / 100).toFixed(2)}
            </span>
          </div>
        </div>
      </Card>

      {joinError && <p className="text-sm text-phantom-danger">{joinError}</p>}

      {s.status === "open" && (
        <div className="space-y-2">
          <Button onClick={handleJoin} disabled={joining} className="w-full">
            {joining ? "Joining..." : "Join Session"}
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => router.push(`/shop?sessionId=${sessionId}`)}
          >
            Visit Shop First
          </Button>
        </div>
      )}

      {s.status === "active" && (
        <Button className="w-full" onClick={() => router.push(`/play/${sessionId}`)}>
          Enter Gameplay
        </Button>
      )}
    </div>
  );
}
