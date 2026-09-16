import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CalendarView } from "@/components/calendar/calendar-view";
import { pageMetadata } from "@/lib/seo";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { listCalendarEventsForProfile, listListingsForProfileCalendar } from "@/db/queries";
import { calendarEventToDisplay, listingToDisplay } from "@/db/mappers";

export const metadata: Metadata = pageMetadata({
  title: "Season Calendar | ScrimmApp",
  description: "Your season calendar and conflict detection.",
  path: "/calendar",
  noIndex: true,
});

export default async function CalendarPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [eventRows, listingRows] = await Promise.all([
    listCalendarEventsForProfile(user.id),
    listListingsForProfileCalendar(user.id),
  ]);

  return (
    <CalendarView
      initialEvents={eventRows.map(calendarEventToDisplay)}
      initialListings={listingRows.map((row) => listingToDisplay(row))}
    />
  );
}
