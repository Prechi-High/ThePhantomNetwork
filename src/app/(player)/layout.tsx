import { LiveFeed } from "@/components/layout/LiveFeed";
import { NavBar } from "@/components/layout/NavBar";

export default function PlayerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pb-16">
      <LiveFeed />
      <main className="mx-auto max-w-lg px-4 py-6">{children}</main>
      <NavBar />
    </div>
  );
}
