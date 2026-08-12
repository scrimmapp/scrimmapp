import { ListingDetail } from "@/components/board/listing-detail";

export default async function ListingPage({ params }: PageProps<"/listings/[id]">) {
  const { id } = await params;
  return <ListingDetail id={id} />;
}
