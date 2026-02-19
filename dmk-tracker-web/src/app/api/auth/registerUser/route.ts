import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000); // 120 seconds

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register-user`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: data.error },
        { status: res.status }
      );
    }

    const response = NextResponse.json(
      { message: data.message,
        otpToken: data.otpToken,
      },
      { status: res.status }
    );

    response.cookies.set("otp_token", data.otpToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 5 * 60, // 5 minutes
    });

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


