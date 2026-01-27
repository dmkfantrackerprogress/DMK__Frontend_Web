"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-extrabold tracking-tight">
          DMK <span className="text-indigo-600">Tracker</span>
        </Link>

        <div className="flex items-center gap-3">

        </div>
      </div>
    </header>
  );
}
