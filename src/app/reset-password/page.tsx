"use client";

import { AuthShell } from "@/components/auth/auth-shell";
import { useAuthStatus } from "@/components/auth/use-auth-status";
import { Field } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const { status, setStatus, errorMessage, setErrorMessage } = useAuthStatus();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;

    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") || "");
    const confirmPassword = String(form.get("confirmPassword") || "");

    if (password !== confirmPassword) {
      setErrorMessage("Passwords don't match.");
      setStatus("error");
      return;
    }

    setStatus("submitting");

    // Clicking the emailed reset link already establishes a recovery session in this browser
    // (Supabase reads it from the URL on load), so this just updates that session's password.
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setErrorMessage(error.message);
      setStatus("error");
      return;
    }

    setStatus("success");
    setTimeout(() => {
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/board";
    }, 700);
  }

  return (
    <AuthShell
      eyebrow="Reset password"
      title="Set a new password"
      subtitle="Choose a new password for your ScrimmApp account."
      status={status}
      errorMessage={errorMessage}
      onSubmit={handleSubmit}
      submitLabel="Update Password"
      submittingLabel="Updating…"
      footerText="Changed your mind?"
      footerLinkLabel="Log in"
      footerLinkHref="/login"
    >
      <Field label="New password" htmlFor="reset-password">
        <PasswordInput id="reset-password" name="password" placeholder="••••••••" required minLength={6} />
      </Field>
      <Field label="Confirm new password" htmlFor="reset-confirm-password">
        <PasswordInput id="reset-confirm-password" name="confirmPassword" placeholder="••••••••" required minLength={6} />
      </Field>
    </AuthShell>
  );
}
