export type JwtPayload = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export async function getDecodedUser(): Promise<JwtPayload | null> {
  try {
    const res = await fetch("http://localhost:3001/auth/me", {
      credentials: "include",
    });

    if (!res.ok) return null;

    return (await res.json()) as JwtPayload;
  } catch (err) {
    console.error("Failed to fetch user:", err);
    return null;
  }
}
