"use client";

import { AuthShell } from "@/components/auth/auth-shell";
import { useAuthStatus } from "@/components/auth/use-auth-status";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const { status, setStatus, errorMessage, setErrorMessage } = useAuthStatus();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "");

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setErrorMessage(error.message);
      setStatus("error");
      return;
    }

    // Deliberately the same "check-email" state regardless of whether the address has an
    // account: revealing that would let anyone probe which emails are registered coaches.
    setStatus("check-email");
  }

  return (
    <AuthShell
      eyebrow="Reset password"
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a link to set a new one."
      status={status}
      errorMessage={errorMessage}
      onSubmit={handleSubmit}
      submitLabel="Send Reset Link"
      submittingLabel="Sending…"
      footerText="Remember your password?"
      footerLinkLabel="Log in"
      footerLinkHref="/login"
    >
      <Field label="Email" htmlFor="forgot-email">
        <Input id="forgot-email" name="email" type="email" placeholder="coach@yourclub.com" required />
      </Field>
    </AuthShell>
  );
}
