"use client";

import { useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Subscribes to INSERT events on a table added to the supabase_realtime publication
 * (migration 0004). The callback receives the raw Postgres row as delivered over the wire:
 * actual column names (snake_case), timestamps as ISO strings, not the camelCase/Date shape
 * Drizzle's query methods produce. Convert with src/db/mappers/camelize.ts and parse any date
 * fields explicitly before merging into UI state, never cast directly.
 */
export function useRealtimeInsert<T>(table: string, filter: string | undefined, onInsert: (row: T) => void) {
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel(`realtime:${table}:${filter ?? "all"}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table, filter },
        (payload) => onInsert(payload.new as T),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter, onInsert]);
}
