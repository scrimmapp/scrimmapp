import type { Metadata } from "next";
import { AnimatedHero } from "@/components/board/animated-hero";
import { PostListingForm } from "@/components/board/post-listing-form";
import { BoardSection } from "@/components/board/board-section";
import { ScrollCue } from "@/components/board/scroll-cue";
import { OnboardingNudge } from "@/components/board/onboarding-nudge";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { listOpenListingsWithCoach, countTeamsForProfile } from "@/db/queries";
import { listingToDisplay } from "@/db/mappers";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Soccer Scrimmage Board | Post & Find Matches in Southern California",
  description:
    "Browse open soccer scrimmages across Southern California or post your team's availability in minutes. Filter by Rec, Club, High School, or Futsal, gender, age group, and travel radius.",
  path: "/board",
});

// Shared with src/app/page.tsx: the root domain renders this same content directly (no
// redirect) rather than bouncing to /board, since Next can't emit a clean server-side 3xx for
// redirect() here (this route tree has a global loading.tsx, which forces the streaming/
// client-side redirect path instead), and that extra client-side hop was flagged by Lighthouse
// as "Avoid multiple page redirects", costing a real round trip on every fresh visit.
export async function BoardPageContent() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const rows = await listOpenListingsWithCoach();
  const initialListings = rows.map((r) => listingToDisplay(r.listing, r));
  const teamCount = user ? await countTeamsForProfile(user.id) : 0;

  return (
    <div className="w-full">
      <section className="relative flex min-h-[calc(100dvh-3rem)] flex-col items-center justify-start px-4 pb-8 pt-8">
        <div className="mx-auto w-full max-w-6xl space-y-3">
          {user && teamCount === 0 && <OnboardingNudge />}
          <AnimatedHero />
          <PostListingForm isLoggedIn={!!user} />
          <div id="post-form-bottom" className="h-px" />
        </div>
        <ScrollCue targetId="scrimmage-board" watchId="post-form-bottom" />
      </section>

      <div id="scrimmage-board" className="mx-auto w-full max-w-6xl space-y-2.5 px-4 py-4">
        <BoardSection initialListings={initialListings} currentUserId={user?.id ?? null} />
      </div>
    </div>
  );
}

export default function BoardPage() {
  return <BoardPageContent />;
}
