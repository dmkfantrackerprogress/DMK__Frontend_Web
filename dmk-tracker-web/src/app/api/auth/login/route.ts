import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30 seconds

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
      {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(body),
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

    if (!data.token) {
      return NextResponse.json(
        { message: "Login failed" },
        { status: 401 }
      );
    }

    const response = NextResponse.json(
      {
        message: data.message,
      },
      { status: res.status }
    );

    response.cookies.set("token", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
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


