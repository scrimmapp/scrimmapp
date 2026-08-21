// Supabase Realtime's postgres_changes payload delivers the raw Postgres row: actual column
// names (snake_case) as plain JSON, not the camelCase shape Drizzle's query methods produce.
// Passing a realtime payload straight into a mapper built for a Drizzle row silently reads
// every field as undefined. This converts keys only; timestamp/date fields still arrive as
// ISO strings and need explicit Date parsing at the call site.
export function camelizeKeys<T = Record<string, unknown>>(raw: Record<string, unknown>): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    const camelKey = key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
    result[camelKey] = value;
  }
  return result as T;
}
