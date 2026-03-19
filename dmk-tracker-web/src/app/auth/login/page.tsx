"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(
        "/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
        return;
      }

      setSuccess(data.message);
      router.replace("/afterLogin/user/dashboard");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4"
      >
        <h1 className="text-2xl font-bold text-black dark:text-black-100">Login</h1>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        {success && (
          <p className="text-green-600 text-sm">{success}</p>
        )}

        <p>
          <strong className="text-black dark:text-black-100">Email:</strong>
          <input
            type="email"
            placeholder="Email"
            required
            className="w-full border p-2 rounded text-black dark:text-black-100"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            autoComplete="off"
          />
        </p>
        
        <p>
          <strong className="text-black dark:text-black-100">Password:</strong>
          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              className="w-full border p-2 rounded pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-black-100"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </p>
       
        {/* ✅ NEW: Forgot Password Link */}
        <div className="text-right">
          <a
            href="/auth/forgot-password"
            className="text-sm text-blue-500 hover:underline"
          >
            Forgot password?
          </a>
        </div>

        <button
          disabled={loading}
          className="w-full bg-black text-white p-2 rounded disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="mt-4 text-center">
          <span className="text-sm text-gray-600">
            No account?{" "}
            <a
              href="/auth/registerUser"
              className="text-blue-500 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
            >
              Go to register
            </a>
          </span>
        </div>

      </form>
    </div>
  );
}
