"use client";

import Link from "next/link";
import { LogoutButton } from "@/components/layout/afterLogin/LogoutButton";
import { useSidebar } from "@/components/layout/afterLogin/Sidebar";
import { User } from "@/types/user";
import { Menu, Settings } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { FaPaypal } from "react-icons/fa";

export default function Header({ user }: { user: User }) {

  const { toggle } = useSidebar();
  const [open, setOpen] = useState(false);

  // Close dropdown when clicking outside
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">

        {/* Sidebar toggle */}
        <button
          onClick={toggle}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800"
          aria-label="Toggle sidebar"
        >
          <Menu />
        </button>

        <Link
          href="/"
          onClick={(e) => {
            e.preventDefault();
            window.location.reload();
          }}
          className="text-xl font-extrabold tracking-tight"
        >
          DMK <span className="text-indigo-600">Tracker</span>
        </Link>

        {/* Right side: Settings + Logout */}
        <div className="flex items-center gap-4">

          {/* PayPal Button */}
          <Link href="/shared/paypal" legacyBehavior>
            <a
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
            >
              <FaPaypal size={22} />
              <span className="hidden md:inline">Support</span>
            </a>
          </Link>

          {/* SETTINGS DROPDOWN */}
          <div className="relative" ref={ref}>
            <button
              onClick={() => setOpen(!open)}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800"
              aria-label="Open settings"
            >
              <Settings />
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border rounded shadow-md">
                <Link href="/afterLogin/user/changePassword" onClick={() => setOpen(false)} className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 whitespace-nowrap text-sm">
                  Change Password
                </Link>
              </div>
            )}
          </div>

          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
