"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function ExpiredTokenLogoutAuto({ children }: { children: React.ReactNode }) {
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Simple example: check localStorage or cookie
    const token = document.cookie.split("; ").find((c) => c.startsWith("token="))?.split("=")[1];

    if (!token) {
      setHasToken(false);
    } else {
      setHasToken(true);
    }
  }, []);

  if (hasToken === null) return null; // loading

  if (hasToken === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-6 rounded shadow text-center">
          <h1 className="text-xl font-bold mb-4">Session expired</h1>
          <p className="mb-4">Your session has expired. Please login again.</p>
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded"
            onClick={() => router.push("/auth/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>; // render dashboard if token exists
}
