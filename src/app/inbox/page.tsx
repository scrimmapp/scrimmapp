import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { MarkInboxReadOnMount } from "@/components/inbox/mark-inbox-read-on-mount";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { listThreadsForProfile } from "@/db/queries";
import { formatMessageTimestamp } from "@/lib/format";

export default async function InboxPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const threads = await listThreadsForProfile(user.id);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-3 px-4 py-4">
      <MarkInboxReadOnMount />
      <div className="border-b border-rule pb-2">
        <h1 className="font-display text-lg font-extrabold tracking-tight text-ink md:text-xl">Coach Communications Inbox</h1>
        <p className="mt-0.5 text-[13px] text-ink-2">Every conversation you&apos;ve started or received, in one place.</p>
      </div>

      {threads.length === 0 ? (
        <Card className="p-6 text-center text-[13px] font-semibold text-muted">
          No conversations yet. Post a scrimmage or reach out to a coach on the board to get started.
        </Card>
      ) : (
        <div className="space-y-2.5">
          {threads.map((t) => (
            <Link key={t.connectionId} href={`/inbox/${t.connectionId}`}>
              <Card className="border-l-4 border-l-pitch p-3 transition-colors hover:bg-surface-2">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-pitch">
                    {t.direction === "received" ? `From: ${t.otherTeamName}` : `To: ${t.otherTeamName}`}
                  </span>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {t.unreadCount > 0 && (
                      <span className="rounded-full bg-crit px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {t.unreadCount}
                      </span>
                    )}
                    <span className="text-[10px] font-semibold text-muted">
                      {formatMessageTimestamp(new Date(t.lastMessageAt))}
                    </span>
                  </div>
                </div>
                <h4 className="mt-1 font-display text-sm font-bold text-ink">
                  {t.direction === "received" ? `Inquiry about your ${t.listingTeamName} listing` : `Your inquiry to ${t.otherTeamName}`}
                </h4>
                <p className="mt-1 line-clamp-2 rounded-control border border-rule bg-paper p-2 text-[12px] leading-relaxed text-ink-2">
                  {t.lastMessageBody}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
