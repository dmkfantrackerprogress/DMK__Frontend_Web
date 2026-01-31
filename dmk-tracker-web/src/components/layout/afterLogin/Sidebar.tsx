"use client";

import Link from "next/link";
import { User } from "@/types/user";
import { usePathname } from "next/navigation";
import { useEffect, createContext, useContext, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

type SidebarContextType = {
  open: boolean;
  toggle: () => void;
  close: () => void;
};

const SidebarContext = createContext<SidebarContextType | null>(null);

export function Sidebar({ user }: { user: User }) {

  const { open, close } = useSidebar();
  const pathname = usePathname();

  const [showUser, setShowUser] = useState(true);
  const [showAdmin, setShowAdmin] = useState(true);

  useEffect(() => {
    close();
  }, [pathname]);

  return (
    <>
      {/* Overlay (mobile) */}
      {open && (
        <div
          className="absolute inset-0 bg-black/30 z-30"
          onClick={close}
        />
      )}

      <aside
        className={`
            absolute left-0 top-0 z-40
            h-screen w-64
            bg-indigo-50 border-r
            transform transition-transform duration-300
            overflow-y-auto
            ${open ? "translate-x-0" : "-translate-x-full"}
        `}
     >
        <nav className="p-6 space-y-6 text-black min-h-full">

          {/* -------- USER GROUP (COLLAPSIBLE) -------- */}
          <div>
            <button
              onClick={() => setShowUser(!showUser)}
              className="w-full text-left font-semibold uppercase text-gray-600 flex justify-between items-center"
            >
              <span>User</span>
              {showUser ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {showUser && (
              <div className="mt-2 space-y-1">
                <Link className="block px-3 py-2 rounded hover:bg-indigo-100"
                  href="/afterLogin/user/dashboard">
                  Dashboard
                </Link>

                <Link className="block px-3 py-2 rounded hover:bg-indigo-100"
                  href="/afterLogin/user/characters">
                  Characters
                </Link>

                <Link className="block px-3 py-2 rounded hover:bg-indigo-100"
                  href="/afterLogin/user/attractions">
                  Attractions
                </Link>

                <Link className="block px-3 py-2 rounded hover:bg-indigo-100"
                  href="/afterLogin/user/feedbacks">
                  Feedbacks
                </Link>

              </div>
            )}
          </div>

          {/* -------- ADMIN GROUP (COLLAPSIBLE) -------- */}
          {user.isAdmin === 1 && (
            <div>
              <button
                onClick={() => setShowAdmin(!showAdmin)}
                className="w-full text-left font-semibold uppercase text-gray-600 flex justify-between items-center"
              >
                <span>Admin</span>
                {showAdmin ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>

              {showAdmin && (
                <div className="mt-2 space-y-1">
                  <Link className="block px-3 py-2 rounded hover:bg-indigo-100"
                    href="/afterLogin/admin/dashboard">
                    Admin Dashboard
                  </Link>

                  <Link className="block px-3 py-2 rounded hover:bg-indigo-100"
                    href="/afterLogin/admin/users">
                    Manage Users
                  </Link>

                  <Link className="block px-3 py-2 rounded hover:bg-indigo-100"
                    href="/afterLogin/admin/otp-log">
                    OTP LOG
                  </Link>

                  <Link className="block px-3 py-2 rounded hover:bg-indigo-100"
                    href="/afterLogin/admin/collection-types">
                    Collection Types
                  </Link>

                  <Link className="block px-3 py-2 rounded hover:bg-indigo-100"
                    href="/afterLogin/admin/collections">
                    Collections
                  </Link>

                  <Link className="block px-3 py-2 rounded hover:bg-indigo-100"
                    href="/afterLogin/admin/characters">
                    Characters
                  </Link>

                  <Link className="block px-3 py-2 rounded hover:bg-indigo-100"
                    href="/afterLogin/admin/characters-level">
                    Characters Level
                  </Link>

                  <Link className="block px-3 py-2 rounded hover:bg-indigo-100"
                    href="/afterLogin/admin/attractions">
                    Attractions
                  </Link>

                  <Link className="block px-3 py-2 rounded hover:bg-indigo-100"
                    href="/afterLogin/admin/attractions-level">
                    Attractions Level
                  </Link>

                  <Link className="block px-3 py-2 rounded hover:bg-indigo-100"
                    href="/afterLogin/admin/feedback">
                    Feedback
                  </Link>

                  <Link className="block px-3 py-2 rounded hover:bg-indigo-100"
                    href="/afterLogin/admin/activity-log">
                    Activity Log
                  </Link>
                </div>
              )}
            </div>
          )}

        </nav>
      </aside>
    </>
  );
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <SidebarContext.Provider
      value={{
        open,
        toggle: () => setOpen((v) => !v),
        close: () => setOpen(false),
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used inside SidebarProvider");
  return ctx;
}
