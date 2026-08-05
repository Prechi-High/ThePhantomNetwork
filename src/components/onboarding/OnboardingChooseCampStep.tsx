"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Castle,
  Crown,
  Shield,
  Sparkles,
  Swords,
  Target,
  Users,
} from "lucide-react";
import { authNetwork } from "@/lib/network";
import { worldNetwork } from "@/lib/network";
import { campsNetwork } from "@/lib/network";
import { PrimaryCTA } from "@/components/design-system";
import { CURRENT_SEASON } from "@/lib/brand/terminology";
import { getDefaultFaction, getFactionBySlug, type FactionCamp } from "@/lib/camps/factions";
import { CampBannerRow } from "./CampBannerRow";
import { LiveWorldHeader, useWorldStats } from "@/components/auth/LiveWorldStats";
import { OnboardingBackButton } from "./shared";

interface CampRow {
  id: string;
  name: string;
  slug: string;
}

interface OnboardingChooseCampStepProps {
  username: string;
  avatarId: string;
  referralCode: string;
  onBack: () => void;
}

export function OnboardingChooseCampStep({
  username,
  avatarId,
  referralCode,
  onBack,
}: OnboardingChooseCampStepProps) {
  const router = useRouter();
  const stats = useWorldStats();
  const [camps, setCamps] = useState<CampRow[]>([]);
  const [selectedSlug, setSelectedSlug] = useState(getDefaultFaction().slug);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activity, setActivity] = useState<string[]>([
    "Solara secured Iron Pass",
    "New rivalry declared",
    "143 Sessions starting",
  ]);

  useEffect(() => {
    campsNetwork.listCamps().then((res) => {
      if (res.ok) {
        setCamps((res.data.camps ?? []) as CampRow[]);
      }
    });
    worldNetwork.getLiveFeed().then((res) => {
      if (res.ok) {
        const events = (res.data as { events?: Array<{ message?: string }> }).events ?? [];
        if (events.length) {
          setActivity(events.slice(0, 5).map((e) => e.message ?? "World activity"));
        }
      }
    });
  }, []);

  const resolveCampId = (slug: string): string | undefined => {
    const match = camps.find((c) => c.slug === slug);
    if (match) return match.id;
    const defaultCamp = camps.find((c) => c.slug === "solara") ?? camps.find((c) => c.slug === "legacies-camp");
    return defaultCamp?.id ?? camps[0]?.id;
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError("");
    const campId = resolveCampId(selectedSlug);
    if (!campId) {
      setError("Camp not available. Try again shortly.");
      setLoading(false);
      return;
    }
    try {
      const result = await authNetwork.completeOnboarding({
        username,
        avatarId,
        campId,
        referralCode: referralCode || undefined,
      });
      if (result.ok) {
        router.push("/home");
        router.refresh();
        return;
      }
      if (result.error.status === 401) {
        setError("Session expired. Please log in again.");
        return;
      }
      setError(result.error.message ?? "Could not complete onboarding.");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectedFaction = getFactionBySlug(selectedSlug) ?? getDefaultFaction();

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-black">
      <Image
        src="/assets/onboarding/choose-camp-bg.png"
        alt=""
        fill
        className="object-cover object-top opacity-50"
        sizes="100vw"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/95" />

      <div className="relative z-10 mx-auto flex w-full max-w-[430px] flex-1 flex-col px-4 pb-8 pt-4">
        <div className="mb-2 flex items-center justify-between">
          <OnboardingBackButton onBack={onBack} />
          <div className="flex h-6 w-6 items-center justify-center text-[#f5b942]">
            <Sparkles className="h-4 w-4" />
          </div>
        </div>

        <LiveWorldHeader playersOnline={stats.playersOnline} seasonLabel={stats.seasonLabel} />

        <div className="mt-3 space-y-2 text-center">
          <h1 className="font-display text-lg font-bold uppercase tracking-wide text-[#f5b942]">
            Welcome to Clashpoint
          </h1>
          <p className="mx-auto max-w-[300px] text-[11px] leading-relaxed text-white/60">
            You have entered a world shaped by rivalry, strategy, and legacy. Every decision from
            this moment forward becomes part of your story.
          </p>
        </div>

        <div className="relative my-3 h-24">
          <CampBannerRow
            selectedSlug={selectedSlug}
            onSelect={(f: FactionCamp) => {
              setSelectedSlug(f.slug);
              setPickerOpen(false);
            }}
            compact
          />
        </div>

        <div className="mb-3 rounded-xl border border-[#f5b942]/25 bg-black/70 p-3 backdrop-blur-md">
          <p className="mb-2 text-[9px] font-bold uppercase tracking-wide text-[#f5b942]">
            World Activity
          </p>
          <ul className="space-y-1.5">
            {activity.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-[10px] text-white/70">
                <Target className="mt-0.5 h-3 w-3 shrink-0 text-legacy-blue" />
                <span>{item}</span>
              </li>
            ))}
            <li className="flex items-start gap-2 text-[10px] text-white/70">
              <Users className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />
              <span>{stats.playersOnline.toLocaleString()} Players online</span>
            </li>
            <li className="flex items-start gap-2 text-[10px] text-white/70">
              <Shield className="mt-0.5 h-3 w-3 shrink-0 text-[#f5b942]" />
              <span>Season {CURRENT_SEASON} is live</span>
            </li>
          </ul>
          <p className="mt-2 text-[9px] font-semibold uppercase text-[#f5b942]/70">
            View All Activity ›
          </p>
        </div>

        <div className="mb-4 grid grid-cols-4 gap-1.5">
          {[
            { icon: Crown, label: "Season 18", value: "Live", color: "text-purple-400" },
            { icon: Swords, label: "War Status", value: "Active", color: "text-red-400" },
            { icon: Castle, label: "Camp Influence", value: "Live", color: "text-emerald-400" },
            { icon: BarChart3, label: "Global Rankings", value: "Updating", color: "text-blue-400" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div
              key={label}
              className="flex flex-col items-center rounded-lg border border-white/10 bg-black/60 py-2 text-center"
            >
              <Icon className={`mb-0.5 h-3.5 w-3.5 ${color}`} />
              <p className="text-[8px] font-bold uppercase text-white/40">{label}</p>
              <p className={`text-[10px] font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {pickerOpen && (
          <div className="mb-3 rounded-xl border border-[#f5b942]/40 bg-black/80 p-3">
            <p className="mb-2 text-center text-xs text-white/70">
              Select your camp — <span style={{ color: selectedFaction.accent }}>{selectedFaction.name}</span>
            </p>
            <CampBannerRow selectedSlug={selectedSlug} onSelect={(f) => setSelectedSlug(f.slug)} />
          </div>
        )}

        {error && <p className="mb-2 text-center text-sm text-legacy-crimson">{error}</p>}

        <PrimaryCTA
          onClick={() => {
            if (pickerOpen) {
              void handleConfirm();
            } else {
              setPickerOpen(true);
            }
          }}
          disabled={loading}
        >
          <span className="flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4" />
            {loading ? "Entering..." : pickerOpen ? `Join ${selectedFaction.name}` : "Choose Your Camp"}
            <ArrowRight className="h-4 w-4" />
          </span>
        </PrimaryCTA>

        <p className="mt-2 text-center text-[9px] font-semibold uppercase tracking-wide text-[#f5b942]/60">
          Every legend begins by choosing where they stand.
        </p>

        <div className="mt-4 flex justify-center gap-1.5">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div
              key={i}
              className={`h-1 rounded-full ${i === 6 ? "w-3 bg-[#f5b942]" : "w-1.5 bg-white/20"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
