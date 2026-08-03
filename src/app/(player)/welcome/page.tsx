"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { InfluenceBar } from "@/components/design-system";
import { APP_NAME } from "@/lib/brand/terminology";

export default function WelcomePage() {
  const router = useRouter();

  const enter = () => {
    localStorage.setItem("legacies_welcome_seen", "1");
    router.push("/tutorial");
  };

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <p className="text-xs uppercase tracking-widest text-legacy-muted">First arrival</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-white">Enter {APP_NAME}</h1>
      <p className="mt-4 max-w-md text-sm text-legacy-muted">
        A living competitive world awaits. Your Legacy begins at zero — every session writes your story.
      </p>
      <div className="mt-8 w-full max-w-sm">
        <InfluenceBar current={0} nextThreshold={500} label="Legacy Influence" />
      </div>
      <Button className="mt-10 w-full max-w-sm" onClick={enter}>
        Enter the world
      </Button>
    </div>
  );
}
