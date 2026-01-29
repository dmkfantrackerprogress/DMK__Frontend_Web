import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ExpiredTokenLogoutAuto }  from "@/components/layout/shared/ExpiredTokenLogoutAuto";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = (await cookies()).get("token")?.value;

  if (!token) {
    redirect("/auth/login");
  }

  return (
    <ExpiredTokenLogoutAuto>
      <div className="min-h-screen flex bg-gray-50">
        {/* Sidebar later */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </ExpiredTokenLogoutAuto>
  );
}
