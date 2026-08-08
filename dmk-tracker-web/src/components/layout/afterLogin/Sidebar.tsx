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

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  //upcoming event 
  const [totalUpcomingEvent, setTotalUpcomingEvent] = useState(0);

  const fetchTotalUpcomingEvent = async () => {
    const res = await fetch("/api/user/event-calendar/getTotalUpcomingEvent", {
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
      return;
    }

    setTotalUpcomingEvent(data.events);

  };

  useEffect(() => {
    close();
    fetchTotalUpcomingEvent();
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
          fixed left-0 top-0 z-60
          h-screen w-64
          bg-indigo-50 border-r
          transform transition-transform duration-300
          flex flex-col
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <nav className="p-6 space-y-6 text-black min-h-full overflow-y-auto">

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

                <Link className="flex items-center gap-2 px-3 py-2 rounded hover:bg-indigo-100"
                  href="/afterLogin/user/eventCalendar">
                  <span>Event Calendar</span>

                  {totalUpcomingEvent > 0 && (
                    <span className="inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold shadow">
                      {totalUpcomingEvent}
                    </span>
                  )}
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
                    href="/afterLogin/admin/characters">
                    Characters
                  </Link>

                  <Link className="block px-3 py-2 rounded hover:bg-indigo-100"
                    href="/afterLogin/admin/charactersLevel">
                    Characters Level
                  </Link>

                  <Link className="block px-3 py-2 rounded hover:bg-indigo-100"
                    href="/afterLogin/admin/attractions">
                    Attractions
                  </Link>

                  <Link className="block px-3 py-2 rounded hover:bg-indigo-100"
                    href="/afterLogin/admin/attractionsLevel">
                    Attractions Level
                  </Link>

                  <Link className="flex items-center gap-2 px-3 py-2 rounded hover:bg-indigo-100"
                    href="/afterLogin/admin/eventCalendar">
                    <span>Event Calendar</span>

                    {totalUpcomingEvent > 0 && (
                      <span className="inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold shadow">
                        {totalUpcomingEvent}
                      </span>
                    )}
                  </Link>

                  <Link className="block px-3 py-2 rounded hover:bg-indigo-100"
                    href="/afterLogin/admin/collections">
                    Collections
                  </Link>

                  <Link className="block px-3 py-2 rounded hover:bg-indigo-100"
                    href="/afterLogin/admin/manageUsers">
                    Manage Users
                  </Link>

                  <Link className="block px-3 py-2 rounded hover:bg-indigo-100"
                    href="/afterLogin/admin/collectiontypes">
                    Collection Types
                  </Link>

                   <Link className="block px-3 py-2 rounded hover:bg-indigo-100"
                    href="/afterLogin/admin/otplog">
                    OTP LOG
                  </Link>

                  <Link className="block px-3 py-2 rounded hover:bg-indigo-100"
                    href="/afterLogin/admin/activitylog">
                    Activity Log
                  </Link>

                  <Link className="block px-3 py-2 rounded hover:bg-indigo-100"
                    href="/afterLogin/admin/eventEmailLog">
                    Event Email Log
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
