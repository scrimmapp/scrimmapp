import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { MarkInboxReadOnMount } from "@/components/inbox/mark-inbox-read-on-mount";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { listInboxForProfile } from "@/db/queries";

export default async function InboxPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const inbox = await listInboxForProfile(user.id);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-3 px-4 py-4">
      <MarkInboxReadOnMount />
      <div className="border-b border-rule pb-2">
        <h1 className="font-display text-lg font-extrabold tracking-tight text-ink md:text-xl">Coach Communications Inbox</h1>
        <p className="mt-0.5 text-[13px] text-ink-2">Direct inquiries from opposing coaches.</p>
      </div>

      {inbox.length === 0 ? (
        <Card className="p-6 text-center text-[13px] font-semibold text-muted">
          Your inbox is empty. Publish a scrimmage on the board to receive inquiries.
        </Card>
      ) : (
        <div className="space-y-2.5">
          {inbox.map((m) => (
            <Card key={m.connectionId} className="border-l-4 border-l-pitch p-3">
              <div className="flex items-start justify-between gap-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-pitch">
                  From: {m.fromTeamName}
                </span>
                <span className="shrink-0 text-[10px] font-semibold text-muted">
                  {m.createdAt.toLocaleDateString()}
                </span>
              </div>
              <h4 className="mt-1 font-display text-sm font-bold text-ink">
                Inquiry about your {m.listingTeamName} listing
              </h4>
              <p className="mt-1 rounded-control border border-rule bg-paper p-2 text-[12px] leading-relaxed text-ink-2">
                {m.message}
              </p>
              <Link
                href={`/listings/${m.listingId}`}
                className="mt-1 inline-block text-[12px] font-bold text-pitch hover:underline"
              >
                View listing →
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
