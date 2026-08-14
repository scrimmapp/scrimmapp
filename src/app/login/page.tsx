"use client";

import { AuthShell } from "@/components/auth/auth-shell";
import { useMockSubmit } from "@/components/auth/use-mock-submit";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const { status, submit } = useMockSubmit("/profile");

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Log in to ScrimmApp"
      subtitle="Pick up right where you left off."
      status={status}
      onSubmit={submit}
      submitLabel="Log In"
      submittingLabel="Logging in…"
      footerText="New to ScrimmApp?"
      footerLinkLabel="Create an account"
      footerLinkHref="/signup"
    >
      <Field label="Email" htmlFor="login-email">
        <Input id="login-email" name="email" type="email" placeholder="coach@yourclub.com" required />
      </Field>
      <Field label="Password" htmlFor="login-password">
        <Input id="login-password" name="password" type="password" placeholder="••••••••" required />
      </Field>
    </AuthShell>
  );
}
