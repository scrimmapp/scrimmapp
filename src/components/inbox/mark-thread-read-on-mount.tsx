"use client";

import { useEffect } from "react";
import { markThreadReadAction } from "@/lib/actions/connections";

export function MarkThreadReadOnMount({ connectionId }: { connectionId: string }) {
  useEffect(() => {
    markThreadReadAction(connectionId);
  }, [connectionId]);
  return null;
}
