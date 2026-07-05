import { LiveFeed } from "@/components/layout/LiveFeed";
import BottomNav from "@/components/ui/BottomNav";
import { SessionBootstrap } from "@/components/auth/SessionBootstrap";
import { ClientErrorReporter } from "@/components/monitoring/ClientErrorReporter";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { PlayerLayoutShell } from "@/components/layout/PlayerLayoutShell";

export default function PlayerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PlayerLayoutShell>
      <SessionBootstrap />
      <ClientErrorReporter />
      <LiveFeed />
      <ErrorBoundary>{children}</ErrorBoundary>
      <BottomNav />
    </PlayerLayoutShell>
  );
}
