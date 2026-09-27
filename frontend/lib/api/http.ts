export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export class ApiError extends Error {
  constructor(
    public path: string,
    public status: number
  ) {
    super(`Request to ${path} failed: ${status}`);
    this.name = "ApiError";
  }
}

/** GET a JSON endpoint. Used by both Server Components (SSR, always fresh) and client hooks. */
export async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { cache: "no-store" });
  if (!res.ok) throw new ApiError(path, res.status);
  return res.json();
}

/** POST a JSON body and parse the JSON response. */
export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new ApiError(path, res.status);
  return res.json();
}
