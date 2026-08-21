import { redirect } from "next/navigation";
import { CalendarView } from "@/components/calendar/calendar-view";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { listCalendarEventsForProfile, listListingsForProfileCalendar } from "@/db/queries";
import { calendarEventToDisplay, listingToDisplay } from "@/db/mappers";

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
      initialListings={listingRows.map(listingToDisplay)}
    />
  );
}
