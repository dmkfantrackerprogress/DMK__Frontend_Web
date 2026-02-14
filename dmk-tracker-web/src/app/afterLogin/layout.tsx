import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Header from "@/components/layout/afterLogin/Header";
import { serverFetch } from "@/lib/serverFetch";
import { User } from "@/types/user";
import { Sidebar, SidebarProvider } from "@/components/layout/afterLogin/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await serverFetch<User>("/api/auth/me");

  return (
      <SidebarProvider>
        <div className="min-h-screen flex flex-col">
        {/* Header */}
        <Header user={user} />

        {/* Middle area (IMPORTANT) */}
        <div className="relative flex-1 flex overflow-hidden">
          <Sidebar user={user} />

          <main className="flex-1 p-6 overflow-y-auto">
            {children}
          </main>
        </div>

      </div>
      </SidebarProvider>
  );

}
