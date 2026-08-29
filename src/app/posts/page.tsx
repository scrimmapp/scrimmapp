import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  listOwnedListings,
  listInquirersForListing,
  getConnectionForListingAndProfiles,
  getProfileById,
  getRatingByConnectionAndRater,
} from "@/db/queries";
import { listingToDisplay } from "@/db/mappers";
import { PostsSection, type PostItem } from "@/components/posts/posts-section";

export default async function PostsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const rows = await listOwnedListings(user.id);

  const items: PostItem[] = await Promise.all(
    rows.map(async (row) => {
      const listing = listingToDisplay(row);

      if (listing.status === "open") {
        const inquirers = await listInquirersForListing(listing.id);
        return { listing, inquirers };
      }

      if ((listing.status === "matched" || listing.status === "completed") && listing.matchedProfileId) {
        const [opponent, connection] = await Promise.all([
          getProfileById(listing.matchedProfileId),
          getConnectionForListingAndProfiles(listing.id, user.id, listing.matchedProfileId),
        ]);
        const alreadyRated = connection ? Boolean(await getRatingByConnectionAndRater(connection.id, user.id)) : false;
        return {
          listing,
          inquirers: [],
          opponentTeamName: opponent?.teamName,
          connectionId: connection?.id,
          alreadyRated,
        };
      }

      return { listing, inquirers: [] };
    }),
  );

  return (
    <div className="mx-auto w-full max-w-3xl space-y-3 px-4 py-4">
      <div className="border-b border-rule pb-2">
        <h1 className="font-display text-lg font-extrabold tracking-tight text-ink md:text-xl">My Posts</h1>
        <p className="mt-0.5 text-[13px] text-ink-2">Manage the scrimmages you&apos;ve posted, active and past.</p>
      </div>
      <PostsSection items={items} />
    </div>
  );
}
