import { LiveFeed } from "@/components/layout/LiveFeed";
import { NavBar } from "@/components/layout/NavBar";
import { SessionBootstrap } from "@/components/auth/SessionBootstrap";
import { ClientErrorReporter } from "@/components/monitoring/ClientErrorReporter";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

export default function PlayerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pb-16">
      <SessionBootstrap />
      <ClientErrorReporter />
      <LiveFeed />
      <main className="mx-auto max-w-lg px-4 py-6">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
      <NavBar />
    </div>
  );
}
