import DashboardSidebar from "@/components/layout/DashboardSidebar";
import type { Profile } from "@/lib/neon";
import { auth } from "@/auth";
import { queryOne } from "@/lib/neon";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const profile = await queryOne<Profile>(
    "SELECT * FROM profiles WHERE id = $1",
    [session.user.id]
  );

  const role = session.user.role || "suscriptor";

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <DashboardSidebar role={role} userName={profile?.name} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden border-b border-zinc-800 bg-zinc-950/80 backdrop-blur px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-white">GameHub</span>
            <span className="text-xs text-zinc-500 capitalize">{role}</span>
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
