"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col items-center justify-center px-4 py-12">
      {/* Hero Section */}
      <div className="text-center max-w-3xl">
        <h1 className="text-5xl font-extrabold mb-4">
          Welcome to DMK Tracker
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8">
          Track characters, attractions, and manage your content effortlessly.
          Admins have access to advanced dashboards and controls.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {!user && (
            <Link
              href="/auth/login"
              className="px-8 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition"
            >
              Login
            </Link>
          )}

          {user?.isAdmin === 1 && (
            <Link
              href="/admin"
              className="px-8 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
            >
              Admin Dashboard
            </Link>
          )}
        </div>
      </div>

      {/* Feature Cards */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-6xl w-full">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow hover:shadow-lg transition">
          <h3 className="font-bold text-xl mb-2">Characters</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Track character stats, totals, and missing entries with ease.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow hover:shadow-lg transition">
          <h3 className="font-bold text-xl mb-2">Attractions</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Monitor attractions, missing information, and insights.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow hover:shadow-lg transition">
          <h3 className="font-bold text-xl mb-2">Reports</h3>
          <p className="text-gray-600 dark:text-gray-300">
            View dashboards, export data, and analyze trends quickly.
          </p>
        </div>
      </div>

      {/* Optional Illustration */}
      <div className="mt-16">
        <img
          src="/images/dashboard-illustration.svg"
          alt="Dashboard Illustration"
          className="w-full max-w-md mx-auto"
        />
      </div>
    </div>
  );
}
