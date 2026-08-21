import { ListingDetail } from "@/components/board/listing-detail";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getListingById, listCommentsForListing } from "@/db/queries";
import { listingToDisplay } from "@/db/mappers";
import type { Comment } from "@/lib/types";

export default async function ListingPage({ params }: PageProps<"/listings/[id]">) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const row = await getListingById(id);
  const listing = row ? listingToDisplay(row) : null;

  const commentRows = listing ? await listCommentsForListing(id) : [];
  const comments: Comment[] = commentRows.map((c) => ({
    id: c.id,
    listingId: c.listingId,
    authorId: c.authorId,
    text: c.body,
    timestamp: c.createdAt.getTime(),
  }));

  return <ListingDetail listing={listing} comments={comments} currentUserId={user?.id ?? null} />;
}
