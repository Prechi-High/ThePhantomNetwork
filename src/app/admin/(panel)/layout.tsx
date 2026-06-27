import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/api/admin-auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { ClientErrorReporter } from "@/components/monitoring/ClientErrorReporter";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-phantom-bg">
      <ClientErrorReporter />
      <AdminNav />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
    </div>
  );
}
