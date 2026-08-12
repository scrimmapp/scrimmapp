"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { seedCalendarEvents, seedInbox, seedListings, seedVenues } from "@/lib/mock-data";
import type { CalendarEvent, Comment, InboxMessage, Listing, Venue } from "@/lib/types";

interface AppDataValue {
  listings: Listing[];
  comments: Comment[];
  calendarEvents: CalendarEvent[];
  inbox: InboxMessage[];
  venues: Venue[];
  addListing: (listing: Omit<Listing, "id" | "createdAt" | "status">) => Listing;
  addComment: (listingId: string, text: string) => void;
  commentsFor: (listingId: string) => Comment[];
  addCalendarEvent: (event: Omit<CalendarEvent, "id">) => void;
  sendInquiry: (listing: Listing, message: string) => void;
  markInboxRead: () => void;
  unreadCount: number;
}

const AppDataContext = createContext<AppDataValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<Listing[]>(seedListings);
  const [comments, setComments] = useState<Comment[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(seedCalendarEvents);
  const [inbox, setInbox] = useState<InboxMessage[]>(seedInbox);
  const [venues] = useState<Venue[]>(seedVenues);

  const addListing = useCallback((input: Omit<Listing, "id" | "createdAt" | "status">) => {
    const listing: Listing = {
      ...input,
      id: `scrim-${Date.now()}`,
      createdAt: Date.now(),
      status: "open",
    };
    setListings((prev) => [listing, ...prev]);
    return listing;
  }, []);

  const addComment = useCallback((listingId: string, text: string) => {
    setComments((prev) => [
      ...prev,
      { id: `c-${Date.now()}`, listingId, text, timestamp: Date.now() },
    ]);
  }, []);

  const commentsFor = useCallback(
    (listingId: string) => comments.filter((c) => c.listingId === listingId),
    [comments],
  );

  const addCalendarEvent = useCallback((event: Omit<CalendarEvent, "id">) => {
    setCalendarEvents((prev) => [...prev, { ...event, id: `cal-${Date.now()}` }]);
  }, []);

  const sendInquiry = useCallback((listing: Listing, message: string) => {
    setInbox((prev) => [
      {
        id: `msg-${Date.now()}`,
        senderTeamName: "Inquiring Opponent Coach",
        subject: `Inquiry regarding match vs ${listing.teamName} (${listing.date})`,
        body: message,
        timestamp: Date.now(),
        isRead: false,
        listingId: listing.id,
      },
      ...prev,
    ]);
  }, []);

  const markInboxRead = useCallback(() => {
    setInbox((prev) => prev.map((m) => ({ ...m, isRead: true })));
  }, []);

  const unreadCount = useMemo(() => inbox.filter((m) => !m.isRead).length, [inbox]);

  const value: AppDataValue = {
    listings,
    comments,
    calendarEvents,
    inbox,
    venues,
    addListing,
    addComment,
    commentsFor,
    addCalendarEvent,
    sendInquiry,
    markInboxRead,
    unreadCount,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
