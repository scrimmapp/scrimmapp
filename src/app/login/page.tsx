"use client";

import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { useAuthStatus } from "@/components/auth/use-auth-status";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const { status, setStatus, errorMessage, setErrorMessage } = useAuthStatus();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErrorMessage(error.message);
      setStatus("error");
      return;
    }

    setStatus("success");
    // A hard navigation, not router.push(): the navbar logo link to /board gets prefetched
    // by Next.js while this page is visible (still logged out), and router.refresh() doesn't
    // reliably invalidate that cached entry before push() would reuse it. A full navigation
    // guarantees the layout re-renders server-side with the just-set session cookie. Verified
    // deterministic across repeated runs; router.push() was not.
    setTimeout(() => {
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/board";
    }, 700);
  }

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Log in to ScrimmApp"
      subtitle="Pick up right where you left off."
      status={status}
      errorMessage={errorMessage}
      onSubmit={handleSubmit}
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
        <PasswordInput id="login-password" name="password" placeholder="••••••••" required />
      </Field>
      <div className="text-right">
        <Link href="/forgot-password" className="text-[12px] font-bold text-pitch hover:underline">
          Forgot password?
        </Link>
      </div>
    </AuthShell>
  );
}
