import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(
      {
        message: data.error,
        details: data.details ?? null,
      },
      { status: res.status }
    );
  }

    return NextResponse.json(
    {
        message: data.message,
        data: data.data,
    });
}
