import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  return (
    <div className="mx-auto w-full max-w-xl space-y-3 px-4 py-5">
      <div className="text-center">
        <h1 className="font-display text-xl font-extrabold tracking-tight text-ink md:text-2xl">Coach Profile</h1>
        <p className="mt-0.5 text-xs text-ink-2">
          Accounts and sign-in arrive in Sprint 2 — this is a preview of the profile layout.
        </p>
      </div>

      <Card className="space-y-3 p-4">
        <div className="flex items-center gap-3 border-b border-rule pb-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-pitch text-sm font-black text-pitch-contrast">
            JR
          </div>
          <div>
            <p className="font-display text-base font-bold text-ink">Javi · Head Coach</p>
            <p className="text-[11px] text-muted">Irvine Strikers FC — U14 Premier</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-ink-2">Reliability score</span>
          <Badge tone="gold">★ 4.9 / 5.0 · Reliable Partner</Badge>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-ink-2">Matches organized</span>
          <span className="font-bold text-ink">12</span>
        </div>
      </Card>
    </div>
  );
}
