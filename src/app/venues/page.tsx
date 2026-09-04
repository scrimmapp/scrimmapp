import { VenuesGrid } from "@/components/venues/venues-grid";
import { listPublicVenues } from "@/db/queries";
import { venueToDisplay } from "@/db/mappers";

export default async function VenuesPage() {
  const rows = await listPublicVenues();
  const venues = rows.map(venueToDisplay);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-3 px-4 py-4">
      <div className="border-b border-rule pb-2">
        <h1 className="field-heading font-display text-lg font-extrabold tracking-tight md:text-xl">Saved Pitch Directory</h1>
        <p className="field-caption mt-0.5 text-[13px]">Verified venues with lighting and parking notes.</p>
      </div>

      <VenuesGrid venues={venues} />
    </div>
  );
}
