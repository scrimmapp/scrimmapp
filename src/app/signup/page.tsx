"use client";

import { AuthShell } from "@/components/auth/auth-shell";
import { useMockSubmit } from "@/components/auth/use-mock-submit";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function SignupPage() {
  const { status, submit } = useMockSubmit("/profile");

  return (
    <AuthShell
      eyebrow="Organize a match"
      title="Create your coach account"
      subtitle="Post scrimmages, track your season, and connect with coaches nearby."
      status={status}
      onSubmit={submit}
      submitLabel="Create Account"
      submittingLabel="Creating account…"
      footerText="Already coaching on ScrimmApp?"
      footerLinkLabel="Log in"
      footerLinkHref="/login"
    >
      <Field label="Coach name" htmlFor="signup-name">
        <Input id="signup-name" name="name" placeholder="Javi Reyes" required />
      </Field>
      <Field label="Team / club" htmlFor="signup-team">
        <Input id="signup-team" name="team" placeholder="Irvine Strikers FC" required />
      </Field>
      <Field label="Email" htmlFor="signup-email">
        <Input id="signup-email" name="email" type="email" placeholder="coach@yourclub.com" required />
      </Field>
      <Field label="Password" htmlFor="signup-password">
        <Input id="signup-password" name="password" type="password" placeholder="••••••••" required />
      </Field>
    </AuthShell>
  );
}
