import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { email, password, otp } = await req.json();
    const cookieStore = await cookies();
    const otpToken = cookieStore.get("otp_token")?.value;

    if (!otpToken) {
      return NextResponse.json(
        { message: "OTP session expired" },
        { status: 401 }
      );
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-otp`,
      {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ email, password, otp, otpToken }),
        credentials: "include",
      }
    );

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

    response.cookies.delete("otp_token");

    return response;
    
  } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Internal server error";

      return NextResponse.json(
        { message: message },
        { status: 500 }
      );
  }
}

