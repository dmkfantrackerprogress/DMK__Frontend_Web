"use client";

import { useRouter } from "next/navigation";

export function ExpiredTokenLogoutAuto({
  hasToken,
  children,
}: {
  hasToken: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();

  if (!hasToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded shadow text-center">
          <h1 className="text-xl font-bold mb-3 text-black dark:text-black-100">
            Session expired
          </h1>
          <p className="mb-4 text-black dark:text-black-100">
            Your session has expired. Please login again.
          </p>
          <button
            onClick={() => router.replace("/auth/login")}
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
