import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Header from "@/components/layout/afterLogin/Header";

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
      <div className="min-h-screen ">     
        <Header />
        <main className="flex-1 p-6">{children}</main>
      </div>

  );
}
