"use client";

import { useState } from "react";

export type AuthStatus = "idle" | "submitting" | "success" | "check-email" | "error";

export function useAuthStatus() {
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  return { status, setStatus, errorMessage, setErrorMessage };
}
