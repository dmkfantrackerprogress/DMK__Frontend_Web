// src/app/(app)/admin/layout.tsx
import { redirect } from "next/navigation";
import { serverFetch } from "@/lib/serverFetch";
import { User } from "@/types/user";

export default async function AdminLayout({ 
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

  if (user.isAdmin !== 1) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
