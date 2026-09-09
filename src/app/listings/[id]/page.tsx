import type { Metadata } from "next";
import { ListingDetail } from "@/components/board/listing-detail";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getListingById, listCommentsForListing } from "@/db/queries";
import { listingToDisplay } from "@/db/mappers";
import { pageMetadata, siteUrl } from "@/lib/seo";
import type { Comment } from "@/lib/types";

export async function generateMetadata({ params }: PageProps<"/listings/[id]">): Promise<Metadata> {
  const { id } = await params;
  const row = await getListingById(id);

  if (!row || row.status !== "open") {
    return pageMetadata({
      title: "Listing Not Found | ScrimmApp",
      description: "This scrimmage listing is no longer available.",
      path: `/listings/${id}`,
      noIndex: true,
    });
  }

  const listing = listingToDisplay(row);
  const title = `${listing.teamName}: ${listing.gender} ${listing.age} ${listing.level} Scrimmage | ScrimmApp`;
  const description = `${listing.teamName} is looking for a ${listing.gender} ${listing.age} ${listing.level} scrimmage near ${listing.location} on ${listing.date}. Connect through ScrimmApp to book the match.`;

  return pageMetadata({ title, description, path: `/listings/${id}` });
}

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

  return (
    <>
      {listing && listing.status === "open" && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SportsEvent",
              name: `${listing.teamName} ${listing.gender} ${listing.age} ${listing.level} Scrimmage`,
              description: listing.notes || `${listing.level} ${listing.subLevel} scrimmage opportunity posted on ScrimmApp.`,
              startDate: listing.date,
              eventStatus: "https://schema.org/EventScheduled",
              eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
              location: { "@type": "Place", name: listing.location },
              sport: "Soccer",
              url: `${siteUrl}/listings/${listing.id}`,
            }),
          }}
        />
      )}
      <ListingDetail listing={listing} comments={comments} currentUserId={user?.id ?? null} />
    </>
  );
}
