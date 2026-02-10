import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { email, newPassword } = await req.json();
    const cookieStore = await cookies();
    const otpToken = cookieStore.get("forgot_password_otp_token")?.value;

    if (!otpToken) {
      return NextResponse.json(
        { message: "OTP session expired" },
        { status: 401 }
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30 seconds

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`,
      {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ email, newPassword, otpToken }),
        credentials: "include",
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        {
          message: data.error,
        },
        { status: res.status }
      );
    }

    const response = NextResponse.json(
      {
        message: data.message,
      },
      { status: res.status }
    );

    response.cookies.delete("forgot_password_otp_token");

    return response;
    
  } catch (err: unknown) {

    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json(
        { message: "Backend took too long — please try again." },
        { status: 504 }
      );
    }

    const message =
      err instanceof Error ? err.message : "Internal server error";

    return NextResponse.json(
      { message },
      { status: 500 }
    );
  }
}

