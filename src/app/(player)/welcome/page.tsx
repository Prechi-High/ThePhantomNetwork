"use client";

import { useRouter } from "next/navigation";
import { InfluenceBar, HeroFocus, PageShell, PrimaryCTA } from "@/components/design-system";
import { APP_NAME } from "@/lib/brand/terminology";

export default function WelcomePage() {
  const router = useRouter();

  const enter = () => {
    localStorage.setItem("legacies_welcome_seen", "1");
    router.push("/tutorial");
  };

  return (
    <div className="flex min-h-screen items-center bg-legacy-bg">
      <PageShell withNav={false} className="w-full space-y-8">
        <HeroFocus
          eyebrow="First arrival"
          title={`Enter ${APP_NAME}`}
          subtitle="A living competitive world awaits. Sessions write your story. Legacy Influence starts at zero."
        >
          <div className="mx-auto mt-4 max-w-sm">
            <InfluenceBar current={0} nextThreshold={500} />
          </div>
        </HeroFocus>
        <PrimaryCTA onClick={enter}>Enter the world</PrimaryCTA>
      </PageShell>
    </div>
  );
}
