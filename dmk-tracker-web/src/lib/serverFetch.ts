import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type FetchOptions = RequestInit & {
  auth?: boolean;
};

export async function serverFetch<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const { auth = true, headers, ...rest } = options;

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}${url}`,
    {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...(auth && token
          ? { Authorization: `Bearer ${token}` }
          : {}),
        ...headers,
      },
      cache: "no-store",
    }
  );

  // Handle token expiry
  if (res.status === 401) {
    // JWT expired or invalid
    redirect("/auth/login"); // Redirect to login page
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API request failed: ${res.status} ${text}`);
  }

  return res.json();
}
