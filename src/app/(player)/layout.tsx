import { LiveFeed } from "@/components/layout/LiveFeed";
import BottomNav from "@/components/ui/BottomNav";
import { SessionBootstrap } from "@/components/auth/SessionBootstrap";
import { ClientErrorReporter } from "@/components/monitoring/ClientErrorReporter";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

export default function PlayerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pb-24">
      <SessionBootstrap />
      <ClientErrorReporter />
      <LiveFeed />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
      <BottomNav />
    </div>
  );
}
