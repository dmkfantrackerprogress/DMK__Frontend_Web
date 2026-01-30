import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Header from "@/components/layout/afterLogin/Header";
import { ExpiredTokenLogoutAuto } from "@/components/layout/afterLogin/ExpiredTokenLogoutAuto";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = (await cookies()).get("token")?.value;
  
  return (
      <ExpiredTokenLogoutAuto hasToken={!!token}>
      <div className="min-h-screen">
        <Header />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </ExpiredTokenLogoutAuto>
  );
}
