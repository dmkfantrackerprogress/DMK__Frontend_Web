import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/requireAuth";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const token = requireAuth();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/change-password`,
      {
        method: "POST",
        headers: {"Content-Type": "application/json", Authorization: `Bearer ${token}`},
        body: JSON.stringify(body),
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

    return NextResponse.json(
      {
        message: data.message,
      },
      { status: res.status }
    );
    
  } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Internal server error";

      return NextResponse.json(
        { message: message },
        { status: 500 }
      );
  }
}

