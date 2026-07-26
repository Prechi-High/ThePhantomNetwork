"use client";

/**
 * GameplayHUD — Arena layout (reference design)
 * Built from scratch: mobile portrait, live API data throughout.
 */

import { useCallback, useState } from "react";
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

  const activateAsset = useCallback(
    async (assetSlug: TacticalAssetSlug, targetId?: string) => {
      if (!subSessionId || !sessionId) return;
      await fetch("/api/gameplay/tactical/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subSessionId, sessionId, assetSlug, targetId }),
      });
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
      }))
    : [];

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
              <div className="arena-tokens-row__value">{Math.round(tokens * 10) / 10}</div>
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
              onTokensAwarded={onTokensAwarded}
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

      {/* ── ENGAGE ── */}
      <div className="arena-engage">
        <div className="arena-card arena-voice">
          <div className="arena-voice__icon-wrap">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#22c55e">
              <rect x="9" y="3" width="6" height="11" rx="3" />
              <path d="M5 11v1a7 7 0 0014 0v-1" stroke="#22c55e" strokeWidth="2" fill="none" />
            </svg>
            <span className="arena-voice__badge">{Math.min(9, voiceCount)}</span>
          </div>
          <div>
            <div className="arena-voice__title">VOICE ROOM</div>
            <div className="arena-voice__count">{voiceCount} / 20</div>
            <div className="arena-voice__wave">
              {[4, 7, 10, 6, 8, 5, 9, 4].map((h, i) => (
                <motion.div
                  key={i}
                  className="arena-voice__wave-bar"
                  animate={{ height: [`${h}px`, `${h + 4}px`, `${h}px`] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.07 }}
                  style={{ opacity: i < 5 ? 1 : 0.4 }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="arena-spin-wrap">
          <button
            type="button"
            className="arena-spin-btn"
            disabled={isSpinning || spinLocked}
            onClick={() => { if (!isSpinning && !spinLocked) onSpin?.(); }}
          >
            <span className="arena-spin-btn__label">{isSpinning ? "…" : "SPIN"}</span>
            <span className="arena-spin-btn__sub">HOLD FOR AUTO</span>
          </button>
        </div>

        <div className="arena-card arena-rec">
          <span className="arena-rec__dot" />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span className="arena-rec__title">REC</span>
              <span className="arena-rec__hd">HD</span>
            </div>
            <span className="arena-rec__sub">SESSION RECORDING</span>
          </div>
        </div>
      </div>

      {/* ── ACTIVE EFFECTS ── */}
      {effects.length > 0 && (
        <section className="arena-effects">
          <div className="arena-effects__header">ACTIVE EFFECTS</div>
          <div className="arena-effects__row">
            {effects.map((effect) => {
              const d = EFFECT_STYLES[effect.type] ?? { color: "#a855f7", icon: "✦" };
              const sec = Math.max(0, Math.ceil(serverTime.getCountdown(effect.expires_at) / 1000));
              return (
                <div key={effect.id} className="arena-effect-pill" style={{ "--pill-color": d.color } as React.CSSProperties}>
                  <span className="arena-effect-pill__icon">{d.icon}</span>
                  <span className="arena-effect-pill__name">{effect.name ?? effect.type}</span>
                  <span className="arena-effect-pill__time">{sec}s</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── MY SKILLS ── */}
      {displaySkills.length > 0 && (
        <section className="arena-skills">
          <div className="arena-skills__header">
            <span className="arena-skills__title">MY SKILLS</span>
            <span className="arena-skills__scroll-hint">SCROLL ›</span>
          </div>
          <div className="arena-skills__row">
            {displaySkills.map((skill) => {
              const st = SKILL_STYLES[skill.id] ?? SKILL_STYLES.default;
              const cdSec = skill.cooldownMs > 0 ? Math.ceil(skill.cooldownMs / 1000) : 0;
              return (
                <div key={skill.id} className="arena-skill-card">
                  <button
                    type="button"
                    className="arena-skill-card__btn"
                    disabled={!skill.isReady}
                    onClick={() => handleSkillActivate(skill.id)}
                    style={{
                      "--skill-border": st.border,
                      "--skill-from": st.from,
                      "--skill-to": st.to,
                    } as React.CSSProperties}
                  >
                    <span className="arena-skill-card__icon">{st.icon}</span>
                    {skill.charges !== undefined && skill.charges > 1 && (
                      <span className="arena-skill-card__charges">×{skill.charges}</span>
                    )}
                  </button>
                  <span className="arena-skill-card__name">{skill.name}</span>
                  <span className={`arena-skill-card__status ${skill.isReady ? "arena-skill-card__status--ready" : cdSec ? "arena-skill-card__status--cd" : "arena-skill-card__status--empty"}`}>
                    {skill.isReady ? "READY" : cdSec ? `${cdSec}s` : "EMPTY"}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

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
