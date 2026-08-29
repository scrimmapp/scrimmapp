import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getThreadForProfile } from "@/db/queries";
import { formatMessageTimestamp } from "@/lib/format";
import { genderToDisplay, levelToDisplay } from "@/db/mappers";
import { MarkThreadReadOnMount } from "@/components/inbox/mark-thread-read-on-mount";
import { ReplyForm } from "@/components/inbox/reply-form";
import { cn } from "@/lib/cn";

export default async function ThreadPage({ params }: PageProps<"/inbox/[connectionId]">) {
  const { connectionId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const thread = await getThreadForProfile(connectionId, user.id);
  if (!thread) notFound();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col px-4 py-4" style={{ minHeight: "calc(100dvh - 2.75rem)" }}>
      <MarkThreadReadOnMount connectionId={connectionId} />

      <div className="flex items-center gap-2 border-b border-rule pb-2">
        <Link href="/inbox" className="rounded-control p-1 text-ink-2 hover:bg-surface-2 hover:text-ink">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-display text-base font-extrabold tracking-tight text-ink">
            {thread.otherProfile?.teamName ?? "Unknown team"}
          </h1>
          <p className="text-[12px] text-ink-2">
            {thread.otherProfile?.coachName}
            {thread.otherProfile?.clubName ? ` · ${thread.otherProfile.clubName}` : ""}
          </p>
          <p className="text-[12px] text-ink-2">
            {thread.listing ? `Re: ${thread.listing.teamName} listing` : "Listing no longer available"}
          </p>
        </div>
      </div>

      {thread.otherTeams.length > 0 && (
        <div className="flex flex-wrap gap-1.5 border-b border-rule py-2">
          {thread.otherTeams.map((t) => (
            <span
              key={t.id}
              className="rounded-pill border border-rule-2 bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-ink-2"
            >
              {t.teamName} · {genderToDisplay(t.gender)} {t.ageGroup} · {levelToDisplay(t.level)} {t.subLevel}
            </span>
          ))}
        </div>
      )}

      <div className="flex-1 space-y-3 overflow-y-auto py-4">
        {thread.messages.map((m) => {
          const isMine = m.senderId === user.id;
          return (
            <div key={m.id} className={cn("flex flex-col", isMine ? "items-end" : "items-start")}>
              <div
                className={cn(
                  "max-w-[80%] rounded-card px-3 py-2 text-[13px] leading-relaxed",
                  isMine ? "bg-pitch text-pitch-contrast" : "border border-rule bg-surface text-ink",
                )}
              >
                {m.body}
              </div>
              <span className="mt-0.5 text-[10px] text-muted">{formatMessageTimestamp(m.createdAt)}</span>
            </div>
          );
        })}
      </div>

      <ReplyForm connectionId={connectionId} />
    </div>
  );
}
