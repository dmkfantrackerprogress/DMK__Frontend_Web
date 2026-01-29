"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    router.replace("/auth/login");
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md
             text-sm font-medium text-white-600
             hover:bg-white-50 dark:hover:bg-white-900/20
             transition"
    >
      <LogOut size={16} />
    </button>
  );
}


