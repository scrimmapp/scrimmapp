import { AnimatedHero } from "@/components/board/animated-hero";
import { PostListingForm } from "@/components/board/post-listing-form";
import { BoardSection } from "@/components/board/board-section";
import { ScrollCue } from "@/components/board/scroll-cue";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { listOpenListings } from "@/db/queries";
import { listingToDisplay } from "@/db/mappers";

export default async function BoardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const rows = await listOpenListings();
  const initialListings = rows.map(listingToDisplay);

  return (
    <div className="w-full">
      <section className="relative flex min-h-[calc(100dvh-3rem)] flex-col items-center justify-start px-4 pb-8 pt-8">
        <div className="mx-auto w-full max-w-6xl space-y-3">
          <AnimatedHero />
          <PostListingForm />
        </div>
        <ScrollCue targetId="scrimmage-board" />
      </section>

      <div id="scrimmage-board" className="mx-auto w-full max-w-6xl space-y-2.5 px-4 py-4">
        <BoardSection initialListings={initialListings} currentUserId={user?.id ?? null} />
      </div>
    </div>
  );
}
