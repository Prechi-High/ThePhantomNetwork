import { CampOwnerNav } from "@/components/camp-owner/CampOwnerNav";
import { AuthGate } from "@/components/auth/AuthGate";
import { SessionBootstrap } from "@/components/auth/SessionBootstrap";

export default function CampOwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-phantom-bg">
      <SessionBootstrap />
      <CampOwnerNav />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <AuthGate requireOwnedCamp>
          {children}
        </AuthGate>
      </main>
    </div>
  );
}
