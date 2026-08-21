"use client";

import { useEffect } from "react";
import { markAllInboxReadAction } from "@/lib/actions/connections";

export function MarkInboxReadOnMount() {
  useEffect(() => {
    markAllInboxReadAction();
  }, []);
  return null;
}
