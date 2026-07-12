"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { reportClientError } from "@/lib/monitoring/client-report";

export interface NetworkPlayer {
  userId: string;
  username: string;
  avatarId?: string | null;
  squadId?: string | null;
}

interface PhantomNetworkIntroProps {
  visible: boolean;
  players: NetworkPlayer[];
  phase?: number;
  onComplete: () => void;
  durationMs?: number;
}

// ── Cinematic boot sequence steps ──────────────────────────────────────────

const BOOT_STEPS = [
  { label: "Connecting...",               icon: "◈" },
  { label: "Synchronizing session...",    icon: "⟳" },
  { label: "Scanning network...",         icon: "⌖" },
  { label: "Locating squad...",           icon: "◉" },
  { label: "Loading camp intelligence...",icon: "⬡" },
  { label: "Receiving battlefield...",    icon: "▦" },
  { label: "Session ready",              icon: "✦" },
];

// ── Deterministic node colour from player ID ────────────────────────────────

function nodeHue(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = id.charCodeAt(i) + ((h << 5) - h);
  return [210, 45, 280, 160, 0, 30, 185][Math.abs(h) % 7];
}

// ── Signal packet that travels across network edges ─────────────────────────

function SignalPacket({ x1, y1, x2, y2, delay }: { x1: number; y1: number; x2: number; y2: number; delay: number }) {
  return (
    <motion.circle
      r="0.6"
      fill="rgba(212,168,83,0.9)"
      initial={{ cx: x1, cy: y1, opacity: 0 }}
      animate={{
        cx: [x1, x2],
        cy: [y1, y2],
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration: 1.2,
        delay,
        repeat: Infinity,
        repeatDelay: 2 + Math.random() * 4,
        ease: "easeInOut",
      }}
    />
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export function PhantomNetworkIntro({
  visible,
  players,
  phase,
  onComplete,
  durationMs = 5000,
}: PhantomNetworkIntroProps) {
  const [progress, setProgress]       = useState(0);
  const [stepIndex, setStepIndex]     = useState(0);
  const [playerCount, setPlayerCount] = useState(players.length || 0);
  const completedRef        = useRef(false);
  const safetyTimeoutRef    = useRef<ReturnType<typeof setTimeout> | null>(null);

  const safeComplete = useRef(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
    onComplete();
  }).current;

  // ── Network node positions ──────────────────────────────────────────────
  const nodes = useMemo(() => {
    const list = players.length
      ? players
      : Array.from({ length: 16 }, (_, i) => ({
          userId: `ghost-${i}`,
          username: `Phantom ${i + 1}`,
          squadId: `squad-${i % 4}`,
        }));

    const squads = new Map<string, NetworkPlayer[]>();
    for (const p of list) {
      const key = p.squadId ?? p.userId;
      if (!squads.has(key)) squads.set(key, []);
      squads.get(key)!.push(p);
    }

    const groups = [...squads.values()].slice(0, 7);
    const result: { x: number; y: number; player: NetworkPlayer; groupIdx: number }[] = [];
    groups.forEach((group, gi) => {
      const angle = (gi / groups.length) * Math.PI * 2 - Math.PI / 2;
      const cx = 50 + Math.cos(angle) * 30;
      const cy = 42 + Math.sin(angle) * 22;
      group.slice(0, 3).forEach((player, i) => {
        result.push({ x: cx + (i - 1) * 7, y: cy + (i % 2 === 0 ? -4 : 4), player, groupIdx: gi });
      });
    });
    return result;
  }, [players]);

  const edges = useMemo(() => {
    const links: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].groupIdx !== nodes[j].groupIdx) {
          links.push({ x1: nodes[i].x, y1: nodes[i].y, x2: nodes[j].x, y2: nodes[j].y });
        }
      }
    }
    return links.slice(0, 30);
  }, [nodes]);

  // ── Progress + step ticker ────────────────────────────────────────────────
  useEffect(() => {
    completedRef.current = false;
    if (!visible) {
      setProgress(0);
      setStepIndex(0);
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
      return;
    }

    const start = Date.now();
    const totalSteps = BOOT_STEPS.length;
    const stepDuration = durationMs / totalSteps;

    const tick = () => {
      const elapsed = Date.now() - start;
      const p = Math.min(1, elapsed / durationMs);
      setProgress(p);
      setStepIndex(Math.min(totalSteps - 1, Math.floor(elapsed / stepDuration)));
      if (p >= 1) safeComplete();
    };

    tick();
    const id = setInterval(tick, 40);

    // Animate live player count upward
    const countTarget = players.length || 124;
    const countId = setInterval(() => {
      setPlayerCount(prev => {
        const next = prev + Math.ceil((countTarget - prev) * 0.12);
        return next >= countTarget ? countTarget : next;
      });
    }, 80);

    safetyTimeoutRef.current = setTimeout(() => {
      if (!completedRef.current) {
        reportClientError({
          area: "gameplay",
          severity: "high",
          message: "PhantomNetworkIntro timed out — forcing completion",
          context: { phase, durationMs, playersCount: players.length },
        });
        safeComplete();
      }
    }, durationMs + 600);

    return () => {
      clearInterval(id);
      clearInterval(countId);
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
    };
  }, [visible, durationMs, phase, players.length, safeComplete]);

  const headerLabel = phase && phase > 0 ? `PHASE ${phase}` : "THE PHANTOM";
  const isLastStep  = stepIndex >= BOOT_STEPS.length - 1;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6 } }}
          className="fixed inset-0 z-[100] flex flex-col overflow-hidden"
          style={{ background: "#04020a" }}
        >
          {/* Deep background radial */}
          <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 45%, rgba(88,28,135,0.22) 0%, rgba(4,2,10,0.95) 70%)" }} />

          {/* Animated grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: "linear-gradient(rgba(168,85,247,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(168,85,247,0.04) 1px,transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          {/* ── Network visualisation ─────────────────────────────── */}
          <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-6">
            <div className="relative h-[min(46vh,380px)] w-full max-w-md">
              <svg viewBox="0 0 100 80" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
                {/* Grid ring lines */}
                {[20, 32, 44].map((r, i) => (
                  <motion.circle
                    key={r}
                    cx="50" cy="42" r={r}
                    fill="none"
                    stroke="rgba(168,85,247,0.08)"
                    strokeWidth="0.3"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.2, duration: 0.6 }}
                    style={{ transformOrigin: "50px 42px" }}
                  />
                ))}

                {/* Edges */}
                {edges.map((e, i) => (
                  <motion.line
                    key={`e-${i}`}
                    x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                    stroke="rgba(212,168,83,0.18)"
                    strokeWidth="0.12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.04, duration: 0.5 }}
                  />
                ))}

                {/* Signal packets travelling edges */}
                {edges.slice(0, 12).map((e, i) => (
                  <SignalPacket key={`sig-${i}`} {...e} delay={i * 0.3} />
                ))}

                {/* Nodes */}
                {nodes.map((n, i) => (
                  <motion.g
                    key={n.player.userId}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 + i * 0.05, type: "spring", stiffness: 280 }}
                    style={{ transformOrigin: `${n.x}px ${n.y}px` }}
                  >
                    {/* Outer pulse ring */}
                    <motion.circle
                      cx={n.x} cy={n.y} r="3.5"
                      fill="none"
                      stroke={`hsla(${nodeHue(n.player.userId)},70%,60%,0.3)`}
                      strokeWidth="0.2"
                      animate={{ r: [3.5, 5, 3.5], opacity: [0.3, 0, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
                    />
                    {/* Node dot */}
                    <circle
                      cx={n.x} cy={n.y} r="2"
                      fill={`hsl(${nodeHue(n.player.userId)},60%,55%)`}
                      stroke="rgba(212,168,83,0.55)"
                      strokeWidth="0.18"
                    />
                  </motion.g>
                ))}

                {/* Centre node — player */}
                <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6, type: "spring", stiffness: 200 }} style={{ transformOrigin: "50px 42px" }}>
                  <motion.circle
                    cx="50" cy="42" r="4.5"
                    fill="none"
                    stroke="rgba(212,168,83,0.45)"
                    strokeWidth="0.3"
                    animate={{ r: [4.5, 7, 4.5], opacity: [0.45, 0, 0.45] }}
                    transition={{ duration: 2.4, repeat: Infinity }}
                  />
                  <circle cx="50" cy="42" r="3.2" fill="rgba(88,28,135,0.9)" stroke="#fbbf24" strokeWidth="0.4" />
                  <text x="50" y="43.2" textAnchor="middle" fontSize="3" fill="#fcd34d" fontWeight="900">P</text>
                </motion.g>
              </svg>
            </div>

            {/* ── Boot sequence steps ──────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-4 w-full max-w-xs text-center"
            >
              {/* Step list */}
              <div className="mb-4 flex flex-col gap-1">
                {BOOT_STEPS.map((step, i) => {
                  const isPast    = i < stepIndex;
                  const isCurrent = i === stepIndex;
                  const isFuture  = i > stepIndex;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: isFuture ? 0.2 : 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.08 }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        justifyContent: "center",
                      }}
                    >
                      <span style={{ fontSize: 10, color: isPast ? "#22c55e" : isCurrent ? "#fbbf24" : "rgba(168,85,247,0.4)", width: 12, textAlign: "center" }}>
                        {isPast ? "✓" : step.icon}
                      </span>
                      <span style={{
                        fontSize: isCurrent ? 11 : 9,
                        fontWeight: isCurrent ? 800 : 600,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: isPast ? "rgba(34,197,94,0.7)" : isCurrent ? "#fbbf24" : "rgba(168,85,247,0.35)",
                        textShadow: isCurrent ? "0 0 10px rgba(251,191,36,0.6)" : "none",
                        transition: "all 0.3s",
                      }}>
                        {step.label}
                      </span>
                      {isCurrent && (
                        <motion.span
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                          style={{ fontSize: 10, color: "#fbbf24" }}
                        >
                          ▮
                        </motion.span>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Session header */}
              <div style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.3em", color: "rgba(168,85,247,0.6)", textTransform: "uppercase", marginBottom: 3 }}>
                  {headerLabel}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    style={{ width: 6, height: 6, borderRadius: "50%", background: isLastStep ? "#22c55e" : "#f59e0b", boxShadow: isLastStep ? "0 0 8px #22c55e" : "0 0 8px #f59e0b" }}
                  />
                  <span style={{ fontSize: 11, fontWeight: 800, color: "rgba(212,168,83,0.85)", letterSpacing: "0.08em" }}>
                    {playerCount.toLocaleString()} connected
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── Progress bar ─────────────────────────────────────────── */}
          <div className="relative px-6 pb-8">
            <div style={{ maxWidth: 320, margin: "0 auto" }}>
              <div style={{ height: 3, borderRadius: 9999, overflow: "hidden", background: "rgba(88,28,135,0.3)", marginBottom: 8 }}>
                <motion.div
                  style={{ height: "100%", background: "linear-gradient(90deg,#7c3aed,#a855f7,#fbbf24)", borderRadius: 9999 }}
                  animate={{ width: `${progress * 100}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(168,85,247,0.5)", textTransform: "uppercase" }}>
                  {isLastStep ? "ENTERING SESSION" : "LOADING"}
                </span>
                <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(212,168,83,0.5)", fontVariantNumeric: "tabular-nums" }}>
                  {Math.round(progress * 100)}%
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
