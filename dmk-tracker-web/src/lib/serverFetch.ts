import { cookies } from "next/headers";

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

  if (!res.ok) {
    throw new Error("API request failed");
  }

  return res.json();
}
