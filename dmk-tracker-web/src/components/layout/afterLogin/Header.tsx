"use client";

import Link from "next/link";
import { LogoutButton } from "@/components/layout/afterLogin/LogoutButton";
import { useSidebar } from "@/components/layout/afterLogin/Sidebar";
import { User } from "@/types/user";
import { Menu } from "lucide-react";

export default function Header({ user }: { user: User }) {

  const { toggle } = useSidebar();

  return (
    <header className="sticky top-0 z-50 w-full border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">

        {/* Toggle button */}
        <button
          onClick={toggle}
          className="p-2 rounded hover:bg-gray-200"
          aria-label="Toggle sidebar"
        >
          <Menu />
        </button>

        <Link href="/" onClick={(e) => { e.preventDefault();window.location.reload();}} className="text-xl font-extrabold tracking-tight">
          DMK <span className="text-indigo-600">Tracker</span>
        </Link>

        <div className="flex items-center gap-3">
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
