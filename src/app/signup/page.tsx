"use client";

import { AuthShell } from "@/components/auth/auth-shell";
import { useAuthStatus } from "@/components/auth/use-auth-status";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const { status, setStatus, errorMessage, setErrorMessage } = useAuthStatus();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");

    const form = new FormData(e.currentTarget);
    const coachName = String(form.get("name") || "");
    const teamName = String(form.get("team") || "");
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");

    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { coach_name: coachName, team_name: teamName } },
    });

    if (error) {
      setErrorMessage(error.message);
      setStatus("error");
      return;
    }

    if (!data.session) {
      // Email confirmation is required before a session is granted.
      setStatus("check-email");
      return;
    }

    setStatus("success");
    // Hard navigation, not router.push(): see the comment in login/page.tsx for why.
    setTimeout(() => {
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/board";
    }, 700);
  }

  return (
    <AuthShell
      eyebrow="Organize a match"
      title="Create your coach account"
      subtitle="Post scrimmages, track your season, and connect with coaches nearby."
      status={status}
      errorMessage={errorMessage}
      onSubmit={handleSubmit}
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
        <PasswordInput id="signup-password" name="password" placeholder="••••••••" required />
      </Field>
    </AuthShell>
  );
}
