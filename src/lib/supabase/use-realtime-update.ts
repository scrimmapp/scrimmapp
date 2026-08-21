"use client";

import { useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Subscribes to UPDATE events on a table added to the supabase_realtime publication (migration
 * 0004). Same raw-row caveat as useRealtimeInsert: payload.new is snake_case DB shape, run it
 * through the matching src/db/mappers/* display mapper before merging into UI state.
 */
export function useRealtimeUpdate<T>(table: string, filter: string | undefined, onUpdate: (row: T) => void) {
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel(`realtime:${table}:update:${filter ?? "all"}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table, filter },
        (payload) => onUpdate(payload.new as T),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter, onUpdate]);
}
