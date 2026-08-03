import { GlobalLiveFeed } from "@/components/layout/LiveFeed";
import BottomNav from "@/components/ui/BottomNav";
import { GlobalFloatingBar } from "@/components/layout/GlobalFloatingBar";
import { SessionBootstrap } from "@/components/auth/SessionBootstrap";
import { ClientErrorReporter } from "@/components/monitoring/ClientErrorReporter";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { PlayerLayoutShell } from "@/components/layout/PlayerLayoutShell";
import { MotionProvider } from "@/components/motion/MotionProvider";

export default function PlayerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MotionProvider>
      <PlayerLayoutShell>
        <SessionBootstrap />
        <ClientErrorReporter />
        <GlobalLiveFeed />
        <GlobalFloatingBar />
        <ErrorBoundary>{children}</ErrorBoundary>
        <BottomNav />
      </PlayerLayoutShell>
    </MotionProvider>
  );
}
