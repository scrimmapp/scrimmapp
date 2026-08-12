import { Card } from "@/components/ui/card";

const faqs = [
  {
    q: "How does the quick-connect inquiry work?",
    a: "Tap Connect on any listing to send a 1-tap quick phrase — e.g. \"Is this match still available?\" — straight to the host coach's inbox, or write a custom message.",
  },
  {
    q: "How does conflict detection work on the Season Calendar?",
    a: "If two events land on the same date and time window (Morning, Afternoon, or Evening), the calendar flags the day with a red conflict badge so you don't double-book your team.",
  },
  {
    q: "Can I edit or cancel a listing after posting it?",
    a: "Yes — from your Coach Profile you can manage active listings, including cancelling with a reason so opposing coaches understand what happened.",
  },
  {
    q: "Is my contact information public?",
    a: "No. Coaches connect through in-app inquiries first; direct contact details are only shared once you choose to share them.",
  },
];

export default function FAQPage() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-2.5 px-4 py-5">
      <h1 className="mb-0.5 text-center font-display text-xl font-extrabold tracking-tight text-ink md:text-2xl">
        Frequently Asked Questions
      </h1>
      {faqs.map((f) => (
        <Card key={f.q} className="space-y-1 p-3.5">
          <h4 className="font-display text-xs font-bold text-pitch">{f.q}</h4>
          <p className="text-[11px] leading-relaxed text-ink-2">{f.a}</p>
        </Card>
      ))}
    </div>
  );
}
