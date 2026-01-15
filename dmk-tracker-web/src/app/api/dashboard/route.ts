import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/requireAuth";
import { serverFetch } from "@/lib/serverFetch";

export async function GET() {
  try {
    await requireAuth();

    const stats = await serverFetch("/dashboard");
    return NextResponse.json(stats);
  } catch {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}
