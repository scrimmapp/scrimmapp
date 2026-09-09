import type { Metadata } from "next";
import { AnimatedHero } from "@/components/board/animated-hero";
import { PostListingForm } from "@/components/board/post-listing-form";
import { BoardSection } from "@/components/board/board-section";
import { ScrollCue } from "@/components/board/scroll-cue";
import { OnboardingNudge } from "@/components/board/onboarding-nudge";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { listOpenListings, countTeamsForProfile } from "@/db/queries";
import { listingToDisplay } from "@/db/mappers";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Soccer Scrimmage Board | Post & Find Matches in Southern California",
  description:
    "Browse open soccer scrimmages across Southern California or post your team's availability in minutes. Filter by Rec, Club, High School, or Futsal, gender, age group, and travel radius.",
  path: "/board",
});

export default async function BoardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const rows = await listOpenListings();
  const initialListings = rows.map(listingToDisplay);
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
