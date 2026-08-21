import { VenuesGrid } from "@/components/venues/venues-grid";
import { listPublicVenues } from "@/db/queries";
import { venueToDisplay } from "@/db/mappers";

export default async function VenuesPage() {
  const rows = await listPublicVenues();
  const venues = rows.map(venueToDisplay);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-3 px-4 py-4">
      <div className="border-b border-rule pb-2">
        <h1 className="font-display text-lg font-extrabold tracking-tight text-ink md:text-xl">Saved Pitch Directory</h1>
        <p className="mt-0.5 text-[13px] text-ink-2">Verified venues with lighting and parking notes.</p>
      </div>

      <VenuesGrid venues={venues} />
    </div>
  );
}
