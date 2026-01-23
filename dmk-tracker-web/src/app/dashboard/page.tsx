import { LogoutButton } from "@/components/layout/auth/LogoutButton";
import { serverFetch } from "@/lib/serverFetch";
import { redirect } from "next/navigation";
import { User } from "@/types/user";

export default async function DashboardPage() {
  const user = await serverFetch<User>("/api/auth/me");
  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <LogoutButton />
      </div>
      {user.isAdmin === 1 && (
        <p className="text-red-600">
          You have admin privileges
        </p>
      )}
    </div>
  );
}
