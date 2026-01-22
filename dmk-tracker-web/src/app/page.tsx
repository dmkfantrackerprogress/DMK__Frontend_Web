"use client";

import Link from "next/link";

/* =========================
   Homepage (No Auth Dependency)
========================= */
export default function HomePage() {
  return (

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-7xl px-6 py-24 text-center">
          <h1 className="text-5xl font-extrabold mb-6">
            Track Your <span className="text-indigo-600">DMK</span> World
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300 mb-10">
            Manage characters, attractions, and reports with a clean, friendly dashboard.
          </p>

          <Link
            href="/auth/login"
            className="inline-flex items-center px-8 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition"
          >
            Get Started
          </Link>
        </section>
      </main>
  
  );
}
