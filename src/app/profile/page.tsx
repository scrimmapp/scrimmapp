import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  return (
    <div className="mx-auto w-full max-w-xl space-y-2.5 px-4 py-4">
      <div className="text-center">
        <h1 className="font-display text-base font-extrabold tracking-tight text-ink md:text-lg">Coach Profile</h1>
        <p className="mt-0.5 text-[11px] text-ink-2">
          Accounts and sign-in arrive in Sprint 2. This is a preview of the profile layout.
        </p>
      </div>

      <Card className="space-y-2.5 p-3.5">
        <div className="flex items-center gap-2.5 border-b border-rule pb-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-pitch text-xs font-black text-pitch-contrast">
            JR
          </div>
          <div>
            <p className="font-display text-sm font-bold text-ink">Javi · Head Coach</p>
            <p className="text-[10px] text-muted">Irvine Strikers FC · U14 Premier</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-ink-2">Reliability score</span>
          <Badge tone="gold" className="gap-1">
            <span className="flex items-center gap-px">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} size={9} strokeWidth={0} className="fill-current" />
              ))}
            </span>
            4.9 · Reliable Partner
          </Badge>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-ink-2">Matches organized</span>
          <span className="font-bold text-ink">12</span>
        </div>
      </Card>
    </div>
  );
}
