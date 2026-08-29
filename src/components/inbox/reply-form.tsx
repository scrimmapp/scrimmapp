"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { sendReplyAction } from "@/lib/actions/connections";

const quickReplies = [
  "Sounds good, let's lock it in!",
  "What time works best for you?",
  "Can you share the exact field address?",
  "We'll need to check and get back to you.",
];

export function ReplyForm({ connectionId }: { connectionId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend(message: string) {
    if (!message.trim() || sending) return;
    setSending(true);
    setError(null);
    const result = await sendReplyAction(connectionId, message.trim());
    setSending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setBody("");
    router.refresh();
  }

  return (
    <div className="space-y-2 border-t border-rule bg-surface p-3">
      {error && <p className="text-[12px] font-semibold text-crit">{error}</p>}
      <div className="flex flex-wrap gap-1.5">
        {quickReplies.map((q) => (
          <button
            key={q}
            type="button"
            disabled={sending}
            onClick={() => handleSend(q)}
            className="rounded-pill border border-rule-2 bg-surface-2 px-2.5 py-1 text-[11px] font-semibold text-ink-2 transition-colors hover:border-pitch/40 hover:text-ink disabled:pointer-events-none disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(body);
        }}
        className="flex items-end gap-2"
      >
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a reply..."
          rows={2}
          className="flex-1"
        />
        <Button type="submit" variant="accent" size="lg" disabled={sending || !body.trim()}>
          {sending ? "Sending…" : "Send"}
        </Button>
      </form>
    </div>
  );
}
