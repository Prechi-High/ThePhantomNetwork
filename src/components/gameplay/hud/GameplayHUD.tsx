"use client";

/**
 * GameplayHUD — Arena layout (reference design)
 * Built from scratch: mobile portrait, live API data throughout.
 */

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import type { SpinOutcome, StealTarget, TacticalAssetSlug } from "@/types/gameplay";
import { usePhaseTimer } from "@/hooks/useRealtimeSession";
import { useSessionStore } from "@/stores/useSessionStore";
import { useLiveFeedStore, type FeedEvent } from "@/stores/useLiveFeedStore";
import { useLiveFeedUpdates } from "@/hooks/useLiveFeedUpdates";
import { useEffectsStore } from "@/stores/useEffectsStore";
import { useEffectsUpdates } from "@/hooks/useEffectsUpdates";
import { useInventoryStore } from "@/stores/useInventoryStore";
import { useInventoryUpdates } from "@/hooks/useInventoryUpdates";
import { useServerTime } from "@/hooks/useServerTime";
import { PremiumSpinWheel } from "@/components/gameplay/premium-wheel";
import { TargetSelectionModal } from "@/components/gameplay/TargetSelectionModal";
import { AnimatedTokenCounter } from "@/components/gameplay/hud/AnimatedTokenCounter";
import { getAssetDisplayName } from "@/lib/brand/terminology";
import { TACTICAL_ASSET_DEFS } from "@/lib/armory/tactical-assets";
import "./arena-hud.css";

export type HudPhaseMode = "loading" | "active" | "revive" | "championship" | "results";

interface SquadMemberData {
  user_id: string;
  session_tokens: number;
  is_eliminated: boolean;
  is_revivable?: boolean;
  profiles?: { username: string } | null;
}

interface TopPlayerEntry {
  rank: number;
  username: string;
  tokens: number;
  userId?: string;
}

export interface GameplayHUDProps {
  phase?: number;
  totalPhases?: number;
  prizePoolCents?: number;
  phaseEndsAt?: number | null;
  tokens?: number;
  playerRank?: number;
  alivePlayers?: number;
  rankingPercentile?: number;
  surgePercent?: number;
  isSpinning?: boolean;
  spinLocked?: boolean;
  lastOutcome?: SpinOutcome | null;
  tokenAmount?: number;
  onSpin?: () => void;
  onSpinComplete?: () => void;
  onTokensAwarded?: (amount: number) => void;
  onStealActivated?: () => void;
  hudPhase?: HudPhaseMode;
  soloMode?: boolean;
  currentUserId?: string;
  topPlayers?: TopPlayerEntry[];
  squadMembers?: SquadMemberData[];
  sessionId?: string;
}

const FEED_ACCENTS: Record<string, string> = {
  steal: "#ef4444",
  revive: "#22c55e",
  lead: "#f59e0b",
  phase: "#a855f7",
  effect: "#38bdf8",
  elimination: "#ef4444",
  surge: "#8b5cf6",
};

const SKILL_STYLES: Record<string, { border: string; from: string; to: string; icon: string }> = {
  steal_boost: { border: "#a855f7", from: "#1a0530", to: "#0a0218", icon: "⚡" },
  guardian:    { border: "#0284c7", from: "#031828", to: "#020d18", icon: "🛡" },
  shield:      { border: "#0284c7", from: "#031828", to: "#020d18", icon: "🛡" },
  veil:        { border: "#4f46e5", from: "#0d0e25", to: "#06061a", icon: "👤" },
  cloak:       { border: "#4f46e5", from: "#0d0e25", to: "#06061a", icon: "👤" },
  multiplier:  { border: "#a855f7", from: "#130530", to: "#07021a", icon: "✕2" },
  insurance:   { border: "#eab308", from: "#1a1202", to: "#0f0a01", icon: "☂" },
  revive:      { border: "#22c55e", from: "#041a0a", to: "#020f06", icon: "💚" },
  default:     { border: "#6b7280", from: "#111", to: "#0a0a0a", icon: "✦" },
};

const EFFECT_STYLES: Record<string, { color: string; icon: string }> = {
  shield:     { color: "#38bdf8", icon: "🛡" },
  cloak:      { color: "#818cf8", icon: "👤" },
  multiplier: { color: "#a855f7", icon: "✕" },
  insurance:  { color: "#fbbf24", icon: "☂" },
  boost:      { color: "#f97316", icon: "⚡" },
};

const DEFAULT_SKILL_SLOTS = [
  { id: "steal_boost", name: "STEAL BOOST" },
  { id: "guardian", name: "SHIELD" },
  { id: "veil", name: "CLOAK" },
  { id: "insurance", name: "INSURANCE" },
] as const;

const AVATARS = ["👻", "🌟", "🦇", "⚡", "🔥", "💀"];

function avatarFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = id.charCodeAt(i) + ((h << 5) - h);
  return AVATARS[Math.abs(h) % AVATARS.length];
}

function formatTimer(ms: number): string {
  if (ms <= 0) return "00:00";
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function rankSuffix(r: number): string {
  return r === 1 ? "st" : r === 2 ? "nd" : r === 3 ? "rd" : "th";
}

function feedStory(event: FeedEvent): string {
  const a = event.actor?.username ?? "Someone";
  const t = event.target?.username ?? "a player";
  const d = event.details ?? {};
  switch (event.type) {
    case "steal": return `${a} stole ${d.amount ?? ""} from ${t}`;
    case "revive": return `${a} revived ${t}`;
    case "lead": return `${a} takes 1st`;
    case "phase": return `${(d.phaseName as string) ?? "Phase"} started`;
    case "effect": return `${a} activated ${getAssetDisplayName((d.effect as string) ?? "effect")}`;
    default: return `${a} made a move`;
  }
}

function feedTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return `${Math.max(1, Math.floor(diff / 1000))}s ago`;
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
  return `${Math.floor(diff / 3600_000)}h ago`;
}

export function GameplayHUD({
  phase = 1,
  totalPhases = 6,
  prizePoolCents = 0,
  phaseEndsAt,
  tokens = 0,
  playerRank = 0,
  alivePlayers = 0,
  rankingPercentile = 0,
  surgePercent = 0,
  isSpinning = false,
  spinLocked = false,
  lastOutcome = null,
  tokenAmount = 0,
  onSpin,
  onSpinComplete = () => {},
  onTokensAwarded,
  onStealActivated,
  soloMode = false,
  currentUserId,
  topPlayers = [],
  squadMembers = [],
  sessionId: sessionIdProp,
}: GameplayHUDProps) {
  const params = useParams<{ sessionId: string }>();
  const sessionId = sessionIdProp ?? params.sessionId;
  const { subSessionId } = useSessionStore();
  const serverTime = useServerTime();

  useLiveFeedUpdates(subSessionId);
  useEffectsUpdates(currentUserId ?? null, subSessionId);
  useInventoryUpdates(currentUserId ?? null, subSessionId, sessionId);

  const events = useLiveFeedStore((s) => s.events);
  const effects = useEffectsStore((s) => s.effects);
  const skills = useInventoryStore((s) => s.skills);

  const remaining = usePhaseTimer(phaseEndsAt ?? null);
  const timerStr = phaseEndsAt ? formatTimer(remaining) : "00:00";
  const isUrgent = remaining > 0 && remaining < 30_000;
  const prizeStr = `$${(prizePoolCents / 100).toLocaleString()}`;
  const surge = Math.max(0, Math.min(100, surgePercent));

  const [targetModalOpen, setTargetModalOpen] = useState(false);
  const [pendingAsset, setPendingAsset] = useState<TacticalAssetSlug | null>(null);
  const [skillTargets, setSkillTargets] = useState<StealTarget[]>([]);
  const [activatingSkillId, setActivatingSkillId] = useState<string | null>(null);
  const [displayTokens, setDisplayTokens] = useState(tokens);
  const [counterReceiving, setCounterReceiving] = useState(false);
  const [autoSpinOn, setAutoSpinOn] = useState(false);

  useEffect(() => {
    if (!isSpinning && !spinLocked) {
      setDisplayTokens(tokens);
    }
  }, [tokens, isSpinning, spinLocked]);

  const handleTokenArrived = useCallback((amount: number) => {
    setDisplayTokens((prev) => Math.round((prev + amount) * 10) / 10);
    setCounterReceiving(true);
    onTokensAwarded?.(amount);
  }, [onTokensAwarded]);

  const activateAsset = useCallback(
    async (assetSlug: TacticalAssetSlug, targetId?: string) => {
      if (!subSessionId || !sessionId) return;
      setActivatingSkillId(assetSlug);
      try {
        await fetch("/api/gameplay/tactical/activate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subSessionId, sessionId, assetSlug, targetId }),
        });
      } finally {
        setTimeout(() => setActivatingSkillId(null), 700);
      }
    },
    [subSessionId, sessionId]
  );

  const handleSkillActivate = useCallback(
    async (skillId: string) => {
      const slug = skillId as TacticalAssetSlug;
      const def = TACTICAL_ASSET_DEFS[slug];
      if (!def) return;
      if (def.requiresTarget) {
        const res = await fetch("/api/gameplay/steal/targets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subSessionId }),
        });
        const data = await res.json();
        setSkillTargets(data.targets ?? []);
        setPendingAsset(slug);
        setTargetModalOpen(true);
        return;
      }
      await activateAsset(slug);
    },
    [subSessionId, activateAsset]
  );

  const handleTargetSelect = useCallback(
    async (targetId: string) => {
      if (!pendingAsset) return;
      await activateAsset(pendingAsset, targetId);
      setTargetModalOpen(false);
      setPendingAsset(null);
    },
    [pendingAsset, activateAsset]
  );

  const squadRows = squadMembers.map((m) => ({
    id: m.user_id,
    name: m.profiles?.username ?? "Player",
    tokens: Number(m.session_tokens),
    isYou: m.user_id === currentUserId,
    isEliminated: m.is_eliminated,
  }));
  const squadMax = Math.max(...squadRows.map((s) => s.tokens), 1);
  const squadWithPct = squadRows.map((m) => ({
    ...m,
    pct: m.isEliminated ? 0 : Math.min(100, (m.tokens / squadMax) * 100),
  }));

  const competitorRows = topPlayers.map((p) => ({
    id: p.userId ?? `${p.rank}`,
    name: p.username,
    tokens: p.tokens,
    rank: p.rank,
    pct: topPlayers.length ? Math.min(100, (p.tokens / Math.max(...topPlayers.map((x) => x.tokens), 1)) * 100) : 0,
  }));

  const displaySkills = skills.length > 0
    ? skills.map((s) => ({
        id: s.id ?? "default",
        name: getAssetDisplayName(s.id ?? "default").slice(0, 11).toUpperCase(),
        charges: s.charges,
        cooldownMs: s.cooldown_until ? serverTime.getCountdown(s.cooldown_until) : 0,
        isReady: s.available && s.charges > 0,
        placeholder: false,
      }))
    : [];

  const skillSlots = (() => {
    const filled = [...displaySkills];
    for (const def of DEFAULT_SKILL_SLOTS) {
      if (filled.length >= 4) break;
      if (!filled.some((s) => s.id === def.id)) {
        filled.push({
          id: def.id,
          name: def.name,
          charges: 0,
          cooldownMs: 0,
          isReady: false,
          placeholder: true,
        });
      }
    }
    return filled.slice(0, 4);
  })();

  const voiceCount = Math.min(alivePlayers, 20);

  return (
    <div className="arena-hud" data-phase={phase}>
      <div className="arena-hud__bg">
        <div className="arena-hud__bg-grid" />
        <div className="arena-hud__bg-vignette" />
      </div>

      {/* ── HEADER ── */}
      <header className="arena-header">
        <div className="arena-header__top">
          <div className="arena-card arena-prize">
            <span className="arena-label">PRIZE POOL</span>
            <span className="arena-value-lg">{prizeStr}</span>
          </div>

          <div className="arena-card arena-phase">
            <div className="arena-phase__row">
              <span className="arena-phase__label">PHASE {phase}/{totalPhases}</span>
              <div className="arena-phase__dots">
                {Array.from({ length: totalPhases }).map((_, i) => (
                  <div
                    key={i}
                    className={`arena-phase__dot ${i + 1 < phase ? "arena-phase__dot--done" : ""} ${i + 1 === phase ? "arena-phase__dot--active" : ""}`}
                    style={i + 1 > phase ? { width: 5 } : undefined}
                  />
                ))}
              </div>
            </div>
            <span className={`arena-phase__timer ${isUrgent ? "arena-phase__timer--urgent" : ""}`}>{timerStr}</span>
            <div className="arena-surge">
              <span className="arena-surge__label">⚡ NEXT: SHADOW SURGE</span>
              <div className="arena-surge__bar">
                <div className="arena-surge__fill" style={{ width: `${surge}%` }} />
              </div>
              <span className="arena-surge__pct">{surge}%</span>
            </div>
          </div>

          <div className="arena-card arena-stats">
            <div className="arena-stats__alive">
              <svg className="arena-stats__alive-icon" viewBox="0 0 24 24" fill="rgba(255,255,255,0.6)">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
              <div>
                <div className="arena-stats__alive-num">{alivePlayers}</div>
                <div className="arena-stats__alive-label">ALIVE</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="arena-stats__rank-label">MY RANK</div>
              <div className="arena-stats__rank">{playerRank || "—"}{playerRank ? rankSuffix(playerRank) : ""}</div>
            </div>
          </div>
        </div>

        <div className="arena-card arena-tokens-row">
          <div className="arena-tokens-row__left">
            <div className="arena-tokens-row__avatar">👻</div>
            <div>
              <div className="arena-tokens-row__label">MY TOKENS</div>
              <AnimatedTokenCounter
                value={displayTokens}
                isReceiving={counterReceiving}
                onReceivePulseEnd={() => setCounterReceiving(false)}
              />
            </div>
          </div>
          <div className="arena-tokens-row__ranking">
            <div className="arena-tokens-row__ranking-label">RANKING</div>
            <div className="arena-tokens-row__ranking-value">TOP {rankingPercentile || "—"}%</div>
          </div>
        </div>
      </header>

      {/* ── MAIN ARENA ── */}
      <div className="arena-main">
        {/* Live Feed */}
        <aside className="arena-card arena-panel">
          <div className="arena-panel__header">
            <span className="arena-live-dot" />
            <span className="arena-panel__title arena-panel__title--feed">LIVE FEED</span>
          </div>
          <div className="arena-feed-list">
            {events.length === 0 ? (
              <span style={{ fontSize: 8, color: "rgba(255,255,255,0.35)" }}>Watching…</span>
            ) : (
              events.slice(0, 6).map((e) => (
                <div key={e.id} className="arena-feed-item" style={{ "--feed-accent": FEED_ACCENTS[e.type] ?? "#a855f7" } as React.CSSProperties}>
                  <span className="arena-feed-item__text">{feedStory(e)}</span>
                  <span className="arena-feed-item__time">{feedTime(e.timestamp)}</span>
                </div>
              ))
            )}
          </div>
          {events.length > 0 && <button type="button" className="arena-feed-viewall">View ALL ›</button>}
        </aside>

        {/* Wheel */}
        <div className="arena-wheel-zone">
          <div className="arena-wheel-zone__arena-bg" />
          <div className="arena-wheel-zone__wheel">
            <PremiumSpinWheel
              isSpinning={isSpinning}
              outcome={lastOutcome}
              tokenAmount={tokenAmount}
              onSpinComplete={onSpinComplete}
              onTokensAwarded={handleTokenArrived}
              onStealActivated={onStealActivated}
            />
          </div>
        </div>

        {/* Squad / Competitors */}
        <aside className="arena-card arena-panel">
          {!soloMode ? (
            <>
              <div className="arena-panel__header">
                <span className="arena-panel__title arena-panel__title--squad">YOUR SQUAD</span>
              </div>
              <div className="arena-squad-list">
                {squadWithPct.length === 0 ? (
                  <span style={{ fontSize: 8, color: "rgba(255,255,255,0.35)" }}>No squad</span>
                ) : (
                  squadWithPct.map((m) => (
                    <div key={m.id} className="arena-squad-member">
                      <div className={`arena-squad-member__avatar ${m.isYou ? "arena-squad-member__avatar--you" : ""}`}>{avatarFor(m.id)}</div>
                      <div className="arena-squad-member__info">
                        <div className="arena-squad-member__name">{m.name}</div>
                        <div className="arena-squad-member__bar">
                          <div className="arena-squad-member__bar-fill" style={{ width: `${m.pct}%` }} />
                        </div>
                      </div>
                      <span className="arena-squad-member__pct">{m.isEliminated ? "✕" : `${Math.round(m.pct)}%`}</span>
                    </div>
                  ))
                )}
              </div>
              {topPlayers.length > 0 && (
                <>
                  <div className="arena-squad-divider">TOP SQUADS</div>
                  {topPlayers.slice(0, 4).map((p) => (
                    <div key={p.rank} className="arena-squad-top-item">
                      <span style={{ color: "#fff", fontWeight: 700 }}>{p.username}</span>
                      <span style={{ color: "#f59e0b", fontWeight: 700 }}>{p.tokens}</span>
                    </div>
                  ))}
                  {topPlayers.length > 4 && <div className="arena-squad-more">+{topPlayers.length - 4} More ▾</div>}
                </>
              )}
            </>
          ) : (
            <>
              <div className="arena-panel__header">
                <span className="arena-panel__title" style={{ color: "#f59e0b" }}>COMPETITORS</span>
              </div>
              <div className="arena-squad-list">
                {competitorRows.length === 0 ? (
                  <span style={{ fontSize: 8, color: "rgba(255,255,255,0.35)" }}>Loading…</span>
                ) : (
                  competitorRows.slice(0, 8).map((p) => (
                    <div key={p.id} className="arena-squad-member">
                      <div className="arena-squad-member__avatar">{avatarFor(p.id)}</div>
                      <div className="arena-squad-member__info">
                        <div className="arena-squad-member__name">#{p.rank} {p.name}</div>
                        <div className="arena-squad-member__bar">
                          <div className="arena-squad-member__bar-fill" style={{ width: `${p.pct}%`, background: "linear-gradient(90deg,#92400e,#f59e0b)" }} />
                        </div>
                      </div>
                      <span className="arena-squad-member__pct" style={{ color: "#f59e0b" }}>{p.tokens}</span>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </aside>
      </div>

      <footer className="arena-bottom-dock">
        {/* Row 1: voice | active effects panel | rec */}
        <section className="arena-effects-bar">
          <button type="button" className="arena-side-stack arena-voice-stack" aria-label="Squad voice chat">
            <span className="arena-voice-stack__icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#22c55e" aria-hidden>
                <rect x="9" y="3" width="6" height="11" rx="3" />
                <path d="M5 11v1a7 7 0 0014 0v-1" stroke="#22c55e" strokeWidth="2" fill="none" />
              </svg>
              <span className="arena-voice__badge">{Math.min(9, voiceCount)}</span>
            </span>
            <span className="arena-voice-stack__label">VOICE</span>
          </button>

          <div className="arena-effects-panel">
            <div className="arena-effects-panel__header">ACTIVE EFFECTS</div>
            <div className="arena-effects-panel__row">
              {effects.length === 0 ? (
                <span className="arena-effects-panel__empty">No active effects</span>
              ) : (
                effects.map((effect) => {
                  const d = EFFECT_STYLES[effect.type] ?? { color: "#a855f7", icon: "✦" };
                  const sec = Math.max(0, Math.ceil(serverTime.getCountdown(effect.expires_at) / 1000));
                  return (
                    <div key={effect.id} className="arena-effect-card" style={{ "--effect-color": d.color } as React.CSSProperties}>
                      <span className="arena-effect-card__icon">{d.icon}</span>
                      <div className="arena-effect-card__body">
                        <span className="arena-effect-card__name">{effect.name ?? effect.type}</span>
                        <span className="arena-effect-card__timer">
                          <svg className="arena-effect-card__hourglass" width="8" height="10" viewBox="0 0 8 10" aria-hidden>
                            <path d="M1 0h6v2L4 5l3 3v2H1V8l3-3L1 2V0z" fill="currentColor" opacity="0.85" />
                          </svg>
                          {sec}s
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <button type="button" className="arena-rec-btn" aria-label="Session recording">
            <span className="arena-rec__dot" />
            <span className="arena-rec__title">REC</span>
          </button>
        </section>

        {/* Row 2: skill tiles */}
        <section className="arena-skills-grid">
          {skillSlots.map((skill) => {
            const st = SKILL_STYLES[skill.id] ?? SKILL_STYLES.default;
            const cdSec = skill.cooldownMs > 0 ? Math.ceil(skill.cooldownMs / 1000) : 0;
            const isActivating = activatingSkillId === skill.id;
            const isPlaceholder = "placeholder" in skill && skill.placeholder;
            return (
              <motion.button
                key={skill.id}
                type="button"
                className={`arena-skill-tile ${isPlaceholder ? "arena-skill-tile--empty" : ""}`}
                disabled={!skill.isReady || isPlaceholder}
                onClick={() => !isPlaceholder && handleSkillActivate(skill.id)}
                animate={
                  isActivating
                    ? { scale: [1, 1.06, 1], boxShadow: [`0 0 0px ${st.border}`, `0 0 20px ${st.border}`, `0 0 0px ${st.border}`] }
                    : { scale: 1 }
                }
                transition={{ duration: 0.55, ease: "easeOut" }}
                style={{
                  "--skill-border": st.border,
                  "--skill-from": st.from,
                  "--skill-to": st.to,
                } as React.CSSProperties}
              >
                <span className="arena-skill-tile__icon">{st.icon}</span>
                <span className="arena-skill-tile__name">{skill.name}</span>
                <span className={`arena-skill-tile__status ${skill.isReady ? "arena-skill-tile__status--ready" : cdSec ? "arena-skill-tile__status--cd" : "arena-skill-tile__status--empty"}`}>
                  {skill.isReady ? "READY" : cdSec ? `${cdSec}s` : "EMPTY"}
                </span>
                {skill.charges !== undefined && skill.charges > 1 && (
                  <span className="arena-skill-tile__charges">×{skill.charges}</span>
                )}
              </motion.button>
            );
          })}
        </section>

        {/* Row 3: auto | spin | speed */}
        <div className="arena-engage">
          <button
            type="button"
            className={`arena-side-stack arena-auto-stack ${autoSpinOn ? "arena-auto-stack--on" : ""}`}
            onClick={() => setAutoSpinOn((v) => !v)}
            aria-label="Auto spin"
          >
            <span className="arena-auto-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 4V1L8 5l4 4V6a6 6 0 016 6 6 6 0 01-6 6 6 6 0 01-5.2-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M12 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M14 10v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            <span className="arena-side-stack__label">AUTO</span>
          </button>

          <button
            type="button"
            className="arena-spin-btn"
            disabled={isSpinning || spinLocked}
            onClick={() => { if (!isSpinning && !spinLocked) onSpin?.(); }}
          >
            <span className="arena-spin-btn__label">{isSpinning ? "…" : "SPIN"}</span>
            <span className="arena-spin-btn__sub">HOLD FOR AUTO</span>
          </button>

          <button type="button" className="arena-side-stack arena-speed-stack" aria-label="Spin speed">
            <span className="arena-speed-value">x1</span>
            <span className="arena-side-stack__label arena-speed-stack__label">SPEED</span>
          </button>
        </div>
      </footer>

      <TargetSelectionModal
        open={targetModalOpen}
        assetSlug={pendingAsset}
        targets={skillTargets}
        onSelect={handleTargetSelect}
        onClose={() => { setTargetModalOpen(false); setPendingAsset(null); }}
      />
    </div>
  );
}
