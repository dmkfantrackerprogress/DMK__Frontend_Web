import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type MeResponse = {
  id: number;
  email: string;
  isAdmin: number; // 0 | 1
};

export async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  // Not logged in
  if (!token) {
    throw new Error("Unauthorized");
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  // Invalid / expired token
  if (!res.ok) {
    throw new Error("Unauthorized");
  }

  const user: MeResponse = await res.json();

  // Not admin
  if (user.isAdmin !== 1) {
    throw new Error("Unauthorized");
  }

  return { user, token };
}
