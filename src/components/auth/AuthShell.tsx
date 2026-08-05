"use client";

import Image from "next/image";
import { AuthStatsFooter, LiveStatusPill, SeasonStatusPill, useWorldStats } from "./LiveWorldStats";

interface AuthShellProps {
  children: React.ReactNode;
  showHero?: boolean;
}

export function AuthShell({ children, showHero = true }: AuthShellProps) {
  const stats = useWorldStats();

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-black">
      <Image
        src="/assets/auth/login-bg.png"
        alt=""
        fill
        priority
        className="object-cover object-top"
        sizes="100vw"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/90" />

      <div className="relative z-10 mx-auto flex w-full max-w-[430px] flex-1 flex-col px-4 pb-6 pt-12">
        <div className="flex items-start justify-between">
          <LiveStatusPill />
          <SeasonStatusPill seasonLabel={stats.seasonLabel} />
        </div>

        {showHero && (
          <div className="pointer-events-none relative mx-auto mt-2 h-28 w-full max-w-[320px] opacity-90">
            <Image
              src="/assets/splash/background.png"
              alt=""
              fill
              className="object-contain object-center"
              sizes="320px"
            />
          </div>
        )}

        <div className="flex flex-1 flex-col justify-center py-4">{children}</div>

        <AuthStatsFooter stats={stats} />
      </div>
    </div>
  );
}
