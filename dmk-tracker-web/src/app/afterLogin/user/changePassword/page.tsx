"use client";

import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  // ---- Password strength checker ----
  const getStrength = (pwd: string) => {
    if (pwd.length < 6) return "Weak ❌";
    if (!/[A-Z]/.test(pwd)) return "Fair ⚠️";
    if (!/[0-9]/.test(pwd)) return "Good 👍";
    if (!/[!@#$%^&*]/.test(pwd)) return "Strong 🔥";
    return "Very Strong 🚀";
  };

  const strength = newPassword ? getStrength(newPassword) : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/changePassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message);
        setSuccess(false); 
      } else {
        setMessage(data.message);
        setSuccess(true);

        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });

        setOldPassword("");
        setNewPassword("");
        window.location.replace("/auth/login");
      }
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-black dark:text-black-100">
          Change Password
        </h1>

       {message && (() => {
          let colorClass = "text-red-500";
          if (success) colorClass = "text-green-500";

          return <p className={`text-sm ${colorClass}`}>{message}</p>;
        })()}

        {/* OLD PASSWORD */}
        <div className="relative w-full">
          <input
            type={showOld ? "text" : "password"}
            placeholder="Old Password"
            required
            className="w-full border p-2 rounded pr-10 text-black dark:text-black-100"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            disabled={loading}
          />

          <button
            type="button"
            onClick={() => setShowOld(!showOld)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
          >
            {showOld ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* NEW PASSWORD */}
        <div className="relative w-full">
          <input
            type={showNew ? "text" : "password"}
            placeholder="New Password"
            required
            className="w-full border p-2 rounded pr-10 text-black dark:text-black-100"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={loading}
          />

          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
          >
            {showNew ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* PASSWORD STRENGTH */}
        {newPassword && (
          <p className="text-sm text-gray-700">
            Strength: <span className="font-semibold">{strength}</span>
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white p-2 rounded disabled:opacity-50"
        >
          {loading ? "Updating..." : "Change Password"}
        </button>
      </form>
    </div>
  );
}
