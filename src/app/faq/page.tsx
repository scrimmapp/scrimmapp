import type { Metadata } from "next";
import { FaqAccordion } from "@/components/faq/faq-accordion";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Frequently Asked Questions | ScrimmApp",
  description:
    "How quick-connect inquiries, season calendar conflict detection, listing management, and contact privacy work on ScrimmApp.",
  path: "/faq",
});

const faqs = [
  {
    q: "How does the quick-connect inquiry work?",
    a: "Tap Connect on any listing to send a 1-tap quick phrase (for example, \"Is this match still available?\") straight to the host coach's inbox, or write a custom message.",
  },
  {
    q: "How does conflict detection work on the Season Calendar?",
    a: "If two events land on the same date and time window (Morning, Afternoon, or Evening), the calendar flags the day with a red conflict badge so you don't double-book your team.",
  },
  {
    q: "Can I edit or cancel a listing after posting it?",
    a: "Yes. From your Coach Profile you can manage active listings, including cancelling with a reason so opposing coaches understand what happened.",
  },
  {
    q: "Is my contact information public?",
    a: "No. Coaches connect through in-app inquiries first; direct contact details are only shared once you choose to share them.",
  },
];

export default function FAQPage() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-2 px-4 py-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />
      <h1 className="field-heading mb-0.5 text-center font-display text-lg font-extrabold tracking-tight md:text-xl">
        Frequently Asked Questions
      </h1>
      <FaqAccordion faqs={faqs} />
    </div>
  );
}
