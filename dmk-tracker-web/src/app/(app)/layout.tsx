import Link from "next/link";
import { serverFetch } from "@/lib/serverFetch";
import { redirect } from "next/navigation";
import { User } from "@/types/user";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user: User;

  try {
   user = await serverFetch<User>("/api/auth/me");
  } catch {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top nav */}
      <header className="border-b bg-white">
        <nav className="max-w-7xl mx-auto flex gap-6 px-6 py-4">
          <Link href="/dashboard" className="font-medium">
            User Dashboard
          </Link>

          {user.isAdmin === 1 && (
            <Link href="/admin" className="font-medium text-red-600">
              Admin
            </Link>
          )}

          <span className="ml-auto text-sm text-gray-500">
             Role: {user.isAdmin === 1 ? "ADMIN" : "USER"}
          </span>
        </nav>
      </header>

      <main className="flex-1 p-6 bg-gray-50">
        {children}
      </main>
    </div>
  );
}
