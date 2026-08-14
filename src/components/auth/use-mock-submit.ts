"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function useMockSubmit(redirectTo: string, delayMs = 1100) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status !== "idle") return;
    setStatus("submitting");
    setTimeout(() => {
      setStatus("success");
      setTimeout(() => router.push(redirectTo), 700);
    }, delayMs);
  }

  return { status, submit };
}
