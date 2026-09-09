import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms and Policies | ScrimmApp",
  description: "ScrimmApp's terms of use, liability disclaimer, account conduct expectations, and privacy policy.",
  path: "/terms",
});

const sections = [
  {
    title: "1. Platform Purpose & Scope",
    body: "ScrimmApp is an independent coordination tool to help youth, high school, club, and adult soccer coaches find and schedule friendly matches (\"scrimmages\"). ScrimmApp is not a sports league, governing body, facility operator, or referee assignor, and does not supervise matches arranged via the Platform.",
  },
  {
    title: "2. Assumption of Risk & Liability Disclaimer",
    body: "Soccer involves inherent risks of bodily injury. ScrimmApp assumes no responsibility or liability for personal injury, illness, property damage, or disputes arising before, during, or after any match scheduled through the Platform. Teams and coaches are solely responsible for inspecting field/goal safety and maintaining their own team insurance and sanctioning body compliance.",
  },
  {
    title: "3. Account Conduct & Reliability",
    body: "Coaches agree to accurately represent their team's birth year, division, and level. If a scrimmage must be canceled, coaches are expected to notify opponents promptly. Excessive no-shows or abusive behavior may result in profile suspension.",
  },
  {
    title: "4. Privacy & Youth Protection",
    body: "Coach contact details shared on the Platform are strictly for match coordination. ScrimmApp is designed for adult coaches and team managers; we do not collect personal data from minors, and coach profiles must not publish minor player contact info.",
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-3 px-4 py-4">
      <div className="text-center">
        <h1 className="field-heading font-display text-lg font-extrabold tracking-tight md:text-xl">
          ScrimmApp Terms and Policies
        </h1>
        <p className="field-caption mt-0.5 text-[12px]">Last Updated: September 2026</p>
      </div>

      <Card className="space-y-3 p-4">
        <p className="text-[13px] leading-relaxed text-ink-2">
          Welcome to ScrimmApp (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). By accessing scrimmapp.com
          (the &ldquo;Platform&rdquo;), you agree to the following terms and policies.
        </p>

        {sections.map((s) => (
          <div key={s.title} className="space-y-1 border-t border-rule pt-3">
            <h2 className="font-display text-[13px] font-bold text-ink">{s.title}</h2>
            <p className="text-[13px] leading-relaxed text-ink-2">{s.body}</p>
          </div>
        ))}
      </Card>
    </div>
  );
}
