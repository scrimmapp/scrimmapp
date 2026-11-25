import { headers } from "next/headers";

export const MAX_LEN = {
  name: 100,
  short: 80,
  location: 300,
  notes: 1000,
  comment: 1000,
  message: 2000,
  feedback: 2000,
  email: 254,
  phone: 30,
} as const;

export function tooLong(fields: [value: string, max: number][]): boolean {
  return fields.some(([value, max]) => value.length > max);
}

// Per-instance memory, so with several Cloud Run instances the real ceiling is a multiple of
// `limit`. Good enough to stop a script hammering one endpoint without adding Redis.
const buckets = new Map<string, number[]>();

export async function isRateLimited(scope: string, limit: number, windowMs: number, key?: string): Promise<boolean> {
  const h = await headers();
  const id = key ?? (h.get("x-forwarded-for")?.split(",")[0].trim() || "unknown");
  const bucketKey = `${scope}:${id}`;
  const now = Date.now();
  const recent = (buckets.get(bucketKey) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    buckets.set(bucketKey, recent);
    return true;
  }
  recent.push(now);
  buckets.set(bucketKey, recent);
  if (buckets.size > 10_000) buckets.clear();
  return false;
}
