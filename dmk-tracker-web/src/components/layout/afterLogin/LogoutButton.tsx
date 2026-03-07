"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });
    window.location.reload();
    router.replace("/auth/login");
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md
             text-sm font-medium text-white-600
             hover:bg-gray-200 dark:hover:bg-gray-800
             transition"
    >
      <LogOut size={25} />
    </button>
  );
}


