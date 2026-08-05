"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Award, Crown, Megaphone, Shield, Swords } from "lucide-react";
import { worldNetwork } from "@/lib/network";
import { cn } from "@/lib/utils";

interface SplashScreenProps {
  nextHref: string;
  durationMs?: number;
}

interface SplashStats {
  activeSessions: number;
  campsCompeting: number;
  rivalriesActive: number;
  playersOnline: number;
  loaded: boolean;
}

const FALLBACK = {
  activeSessions: 128,
  campsCompeting: 56,
  rivalriesActive: 312,
  playersOnline: 24850,
};

function formatCount(n: number): string {
  return n.toLocaleString();
}

function displayStat(value: number, fallback: number, loaded: boolean) {
  return loaded && value > 0 ? value : fallback;
}

function StatCard({
  icon: Icon,
  value,
  label,
  accent,
  barColor,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string | number;
  label: string;
  accent: string;
  barColor: string;
}) {
  return (
    <div className="relative flex min-w-0 flex-1 flex-col items-center overflow-hidden rounded-lg border border-white/[0.08] bg-black/75 py-2.5 backdrop-blur-sm">
      <Icon className={cn("mb-1 h-[18px] w-[18px] shrink-0", accent)} />
      <p className="text-lg font-bold leading-none tabular-nums text-white">{value}</p>
      <p className={cn("mt-1 px-0.5 text-center text-[6.5px] font-bold uppercase leading-tight tracking-wide", accent)}>
        {label}
      </p>
      <div className={cn("absolute bottom-0 left-0 right-0 h-[2px]", barColor)} />
    </div>
  );
}

export function SplashScreen({ nextHref, durationMs = 4500 }: SplashScreenProps) {
  const router = useRouter();
  const [fade, setFade] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<SplashStats>({
    activeSessions: 0,
    campsCompeting: 0,
    rivalriesActive: 0,
    playersOnline: 0,
    loaded: false,
  });

  useEffect(() => {
    worldNetwork.getSummary().then((res) => {
      if (!res.ok) return;
      const s = res.data?.stats;
      const camps = res.data?.campMomentum?.length ?? 0;
      setStats({
        activeSessions: s?.activeSessions ?? 0,
        campsCompeting: camps,
        rivalriesActive: Math.max(s?.recentSteals ?? 0, camps * 3),
        playersOnline: s?.playersOnline ?? 0,
        loaded: true,
      });
    });
  }, []);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const pct = Math.min(100, ((now - start) / durationMs) * 100);
      setProgress(pct);
      if (pct < 100) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [durationMs]);

  useEffect(() => {
    const fadeT = setTimeout(() => setFade(true), durationMs - 500);
    const t = setTimeout(() => {
      router.replace(nextHref);
    }, durationMs);
    return () => {
      clearTimeout(t);
      clearTimeout(fadeT);
    };
  }, [nextHref, durationMs, router]);

  const sessions = displayStat(stats.activeSessions, FALLBACK.activeSessions, stats.loaded);
  const camps = displayStat(stats.campsCompeting, FALLBACK.campsCompeting, stats.loaded);
  const rivalries = displayStat(stats.rivalriesActive, FALLBACK.rivalriesActive, stats.loaded);
  const online = displayStat(stats.playersOnline, FALLBACK.playersOnline, stats.loaded);

  const tickerDetail =
    stats.activeSessions > 0
      ? `${stats.activeSessions} Sessions starting soon • Camp Wars in progress • Rivalries intensifying`
      : "3 Sessions starting soon • 2 Camp Wars in progress • Rivalries intensifying";

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex justify-center bg-black transition-opacity duration-500",
        fade ? "opacity-0" : "opacity-100"
      )}
    >
      {/* Background — banners, world map, arena */}
      <Image
        src="/assets/splash/background.png"
        alt=""
        fill
        priority
        className="object-cover object-[center_14%]"
        sizes="100vw"
      />

      {/* Atmospheric overlays — kept below logo area */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/25 via-transparent to-black/90" />

      {/* Composed layout */}
      <div className="relative z-10 h-dvh w-full max-w-[430px]">
        {/* Hero logo — solid opaque asset, no blend or fade */}
        <div className="pointer-events-none absolute left-1/2 top-[11%] z-40 w-[77%] max-w-[312px] -translate-x-1/2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/splash/full-logo.png?v=2"
            alt="Clash Point"
            className="block h-auto w-full select-none"
            style={{ opacity: 1 }}
            draggable={false}
          />
        </div>

        {/* World status — top right */}
        <div className="absolute right-3 top-3 z-30">
          <div className="rounded-lg border border-white/10 bg-black/70 px-3 py-2 backdrop-blur-md">
            <div className="flex items-center justify-end gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#39D98A] shadow-[0_0_6px_#39D98A]" />
              <span className="text-[8px] font-semibold uppercase tracking-widest text-white/45">
                World Status
              </span>
            </div>
            <p className="text-right text-sm font-bold uppercase tracking-wide text-[#39D98A]">Live</p>
            <p className="text-right text-[9px] font-semibold uppercase tracking-wide text-white/70">
              {formatCount(online)} Players Online
            </p>
          </div>
        </div>

        {/* Bottom HUD */}
        <div className="absolute bottom-0 left-0 right-0 z-30 space-y-2 px-3 pb-6">
          {/* Live feed bar */}
          <div className="rounded-lg border border-[#f5b942]/35 bg-black/75 px-3 py-2 backdrop-blur-md">
            <div className="flex items-start gap-2">
              <Megaphone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#f5b942]" />
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-bold uppercase tracking-wide text-[#f5b942]">
                  The World Never Stops
                </p>
                <p className="truncate text-[8px] text-white/55">{tickerDetail}</p>
              </div>
              <span className="shrink-0 text-[7px] font-semibold uppercase text-[#f5b942]/80">
                View Live Feed ›
              </span>
            </div>
          </div>

          {/* Stats grid */}
          <div className="flex gap-1.5">
            <StatCard
              icon={Swords}
              value={sessions}
              label="Live Sessions In Progress"
              accent="text-[#f5b942]"
              barColor="bg-[#f5b942]"
            />
            <StatCard
              icon={Award}
              value={camps}
              label="Camps Competing"
              accent="text-[#4C8DFF]"
              barColor="bg-[#4C8DFF]"
            />
            <StatCard
              icon={Shield}
              value={rivalries}
              label="Rivalries Active"
              accent="text-[#A78BFA]"
              barColor="bg-[#A78BFA]"
            />
            <StatCard
              icon={Crown}
              value={formatCount(online)}
              label="Players Online Right Now"
              accent="text-[#39D98A]"
              barColor="bg-[#39D98A]"
            />
          </div>

          {/* Loading */}
          <div className="space-y-2 pt-1">
            <p className="text-center text-[9px] font-semibold uppercase tracking-[0.16em] text-white/50">
              « Entering The Competitive World… »
            </p>
            <div className="flex items-center gap-2 px-1">
              <div className="relative h-[5px] flex-1 overflow-hidden rounded-full bg-[#1a1510]">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#b8860b] via-[#f5b942] to-[#ffd875] shadow-[0_0_12px_rgba(245,185,66,0.65)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="w-9 shrink-0 text-right text-[11px] font-bold tabular-nums text-[#f5b942]">
                {Math.round(progress)}%
              </span>
            </div>
            <p className="text-center text-[11px] text-white/40">
              Every decision shapes your{" "}
              <span className="font-semibold text-[#f5b942]">legacy.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
