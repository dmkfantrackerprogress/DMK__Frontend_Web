import { NextResponse } from "next/server";
import { serverFetch } from "@/lib/serverFetch";
import { requireAdmin } from "@/lib/requireAdmin";
import { requireAuth } from "@/lib/requireAuth";

export async function GET(req: Request) {

  try {
    
    const { searchParams } = new URL(req.url);
    const queryString = searchParams.toString();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000); // 120 seconds

    const { token } = await requireAdmin();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/activity-logs/list?${queryString}`,
      {
        method: "GET",
        headers: {"Content-Type": "application/json", Authorization: `Bearer ${token}`},
        credentials: "include",
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

    return NextResponse.json(
      {
        message: data.message,
        activitylogs: data.data,
        meta: data.meta,
      },
      { status: 200 }
    );

  } catch (err: unknown) {

    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json(
        { message: "Backend took too long — please try again." },
        { status: 504 }
      );
    }

    const message =
      err instanceof Error ? err.message : "Internal server error";

    return NextResponse.json({ message }, { status: 500 });
  }
}
