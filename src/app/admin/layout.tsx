import { AdminNav } from "@/components/admin/AdminNav";
import { AuthGate } from "@/components/auth/AuthGate";
import { SessionBootstrap } from "@/components/auth/SessionBootstrap";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-phantom-bg">
      <SessionBootstrap />
      <AdminNav />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <AuthGate requiredRole="admin">{children}</AuthGate>
      </main>
    </div>
  );
}
