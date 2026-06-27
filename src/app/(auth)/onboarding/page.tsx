import { Suspense } from "react";
import OnboardingContent from "./OnboardingContent";

export default function OnboardingPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center text-phantom-muted">Loading...</p>}>
      <OnboardingContent />
    </Suspense>
  );
}
