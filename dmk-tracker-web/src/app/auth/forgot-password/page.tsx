"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import confetti from "canvas-confetti";

export default function forgotPassword() {
  const router = useRouter();
  const [step, setStep] = useState<"forgot" | "otp">("forgot");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [otpToken, setOtpToken] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const OTP_LENGTH = 6;
  const [otpArray, setOtpArray] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const otpRefs = useRef<HTMLInputElement[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const [resendTimer, setResendTimer] = useState(300); // 5 min
  const MAX_TIMER = 300;

  // Countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "otp" && resendTimer > 0) {
      timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendTimer]);

  // Auto-focus first OTP box
  useEffect(() => {
    if (step === "otp" && otpRefs.current[0]) {
      otpRefs.current[0].focus();
      setActiveIndex(0);
    }
  }, [step]);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  // Forgot Password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgotPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message);
        setSuccess(false); 
        setResetSuccess(false);
      }
      else {
        setOtpToken(data.otpToken);
        setStep("otp");
        setMessage(data.message);
        setResendTimer(MAX_TIMER);
        setOtpArray(Array(OTP_LENGTH).fill(""));
        setEmail(email);
        setResetSuccess(true);
        setSuccess(false); 
      }
    } catch (err) {
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Reset Password with OTP
  const handleResetPassword = async () => {
    const otpString = otpArray.join("");
    if (!otpToken || otpString.length !== OTP_LENGTH) return;

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/resetPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otpToken, newPassword: otpString, email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message);
        setShake(true);
        setTimeout(() => setShake(false), 500);
      } else {
        setMessage(data.message);
        setSuccess(true);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        setTimeout(() => router.replace("/auth/login"), 1500);
      }
    } catch (err) {
      setMessage("Something went wrong. Please try again.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (!email  || resendTimer > 0) return;
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgotPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message); 
        setSuccess(false);
        setResetSuccess(false);
      }
      else {
        setOtpToken(data.otpToken);
        setMessage(data.message);
        setResendTimer(MAX_TIMER);
        setOtpArray(Array(OTP_LENGTH).fill(""));
        if (otpRefs.current[0]) otpRefs.current[0].focus();
        setActiveIndex(0);
        setSuccess(false);
        setResetSuccess(true);
      }
    } catch {
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // OTP input change
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value.replace(/\D/, "");
    if (!val) return;

    const newOtpArray = [...otpArray];
    newOtpArray[index] = val;
    setOtpArray(newOtpArray);

    setActiveIndex(index < OTP_LENGTH - 1 ? index + 1 : index);

    if (index < OTP_LENGTH - 1) otpRefs.current[index + 1].focus();
    if (index === OTP_LENGTH - 1 && newOtpArray.every((digit) => digit !== "")) handleResetPassword();
  };

  // OTP backspace
  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      const newOtpArray = [...otpArray];
      if (newOtpArray[index]) {
        newOtpArray[index] = "";
        setOtpArray(newOtpArray);
        setActiveIndex(index);
      } else if (index > 0) {
        otpRefs.current[index - 1].focus();
        newOtpArray[index - 1] = "";
        setOtpArray(newOtpArray);
        setActiveIndex(index - 1);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-6 rounded shadow">
        {step === "forgot" ? (
          <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold text-black dark:text-black-100">Forgot Password</h1>
            {message && <p className="text-sm text-red-500">{message}</p>}

            <p>
              <strong className="text-black dark:text-black-100">Email:</strong>
              <input
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-black-100"
                disabled={loading}
                autoComplete="off"
              />
            </p>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white p-2 rounded disabled:opacity-50"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>

            <p className="text-center text-sm text-gray-600">
              Remember Password?{" "}
              <a
                href="/auth/login"
                className="text-blue-500 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
              >
                Go to Login
              </a>
            </p>
          </form>
        ) : (
          <div className="flex flex-col gap-4 relative">
            <h1 className="text-2xl font-bold text-center text-black dark:text-black-100">Reset Password</h1>

            {message && (() => {
              let colorClass = "text-red-500";
              if (resetSuccess) colorClass = "text-green-500";
              else if (success) colorClass = "text-green-500";

              return <p className={`text-sm ${colorClass}`}>{message}</p>;
            })()}


            {/* OTP Timer + Progress Bar */}
            <div className="w-full h-2 bg-gray-200 rounded overflow-hidden mb-2 relative">
              <div
                className="h-2 bg-blue-500 transition-all duration-1000"
                style={{ width: `${(resendTimer / MAX_TIMER) * 100}%` }}
              ></div>
            </div>

            <div className={`flex justify-center gap-2 relative ${shake ? "animate-shake" : ""}`}>
              {otpArray.map((value, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={value}
                  onChange={(e) => handleOtpChange(e, index)}
                  onKeyDown={(e) => handleOtpKeyDown(e, index)}
                  ref={(el) => {otpRefs.current[index] = el!;}}
                  className={`text-black dark:text-black-100 w-12 h-12 text-center border rounded text-lg focus:outline-none focus:ring-2 transition-all ${
                    activeIndex === index ? "border-blue-500 ring-2 ring-blue-400" : "border-gray-300"
                  }`}
                  disabled={loading}
                />
              ))}

              {step === "otp" && success && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded transition-all duration-500">
                  <CheckCircleIcon className="h-16 w-16 text-green-500 animate-scale-up" />
                </div>
              )}
            </div>

            {/* Verify OTP */}
            <button
              onClick={handleResetPassword}
              disabled={loading || otpArray.some((digit) => digit === "")}
              className="w-full bg-blue-500 p-2 rounded disabled:opacity-50 text-black dark:text-black-100"
            >
              {loading ? "Resetting Password..." : "Reset Password"}
            </button>

            {/* Resend OTP (visually linked to timer) */}
            <button
              onClick={handleResendOTP}
              disabled={loading || resendTimer > 0}
              className={`
                w-full p-2 rounded transition-all duration-500
                ${resendTimer > 0
                  ? "bg-gray-200 text-black dark:text-black-100 cursor-not-allowed opacity-60"
                  : "bg-gray-100 text-black dark:text-black-100 hover:bg-gray-200 opacity-100"}
              `}
            >
              {resendTimer > 0 ? `Resend OTP in ${formatTime(resendTimer)}` : "Resend OTP"}
            </button>
          </div>
        )}
      </div>

      {/* Animations */}
      <style>
        {`
          .animate-scale-up {
            animation: scale-up 0.5s ease forwards;
          }
          @keyframes scale-up {
            0% { transform: scale(0.5); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
          .animate-shake {
            animation: shake 0.5s ease;
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-6px); }
            40%, 80% { transform: translateX(6px); }
          }
        `}
      </style>
    </div>
  );
}
