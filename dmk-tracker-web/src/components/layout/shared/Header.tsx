"use client";

import Link from "next/link";
import { FaPaypal } from "react-icons/fa";
import { BiCoffeeTogo } from "react-icons/bi";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-extrabold tracking-tight">
          DMK <span className="text-indigo-600">Tracker</span>
        </Link>

        <div className="flex items-center gap-4">

          {/* PayPal Button */}
          <Link
            href="/shared/paypal"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded-full shadow-md transition"
          >
            <BiCoffeeTogo size={18} />
            <span className="hidden md:inline">Buy me a coffee</span>
          </Link>

        </div>
      </div>
    </header>
  );
}
