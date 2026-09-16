export type Gender = "Boys" | "Girls";
export type Level = "Club" | "High School" | "Rec" | "Futsal";
export type TimeWindow = "Morning" | "Afternoon" | "Evening";
export type RefFee = "50/50 Split" | "Host Pays Ref" | "Visitor Pays" | "No Ref";
export type TravelRadius =
  | "Host Pitch Only (0 mi)"
  | "Up to 10 miles"
  | "Up to 25 miles"
  | "Up to 50 miles"
  | "100+ miles (Willing to Travel)";
export type CompetitivePreference = "Similar" | "Stronger" | "Developing";

export interface Listing {
  id: string;
  ownerId: string;
  createdAt: number;
  teamName: string;
  gender: Gender;
  age: string;
  level: Level;
  subLevel: string;
  competitivePreference: CompetitivePreference;
  travelRadius: TravelRadius;
  date: string;
  time: TimeWindow;
  location: string;
  fieldNumber?: string;
  isHosting: boolean;
  hasRef: boolean;
  refFee: RefFee;
  hasFieldFee: boolean;
  hydrationStation: boolean;
  canopiesForOpponent: boolean;
  isRecorded: boolean;
  homeColor?: string;
  awayColor?: string;
  notes?: string;
  status: "open" | "matched" | "cancelled" | "completed";
  matchedProfileId?: string;
  coachName?: string;
  reliabilityScore?: number;
  ratingsCount?: number;
}

export interface Comment {
  id: string;
  listingId: string;
  authorId: string;
  text: string;
  timestamp: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: TimeWindow;
  location?: string;
  kind: "league" | "scrimmage" | "tournament" | "blackout" | "practice";
}

export interface InboxMessage {
  id: string;
  senderTeamName: string;
  subject: string;
  body: string;
  timestamp: number;
  isRead: boolean;
  listingId?: string;
}

export interface Venue {
  id: string;
  name: string;
  city: string;
  fields: string;
  lights: boolean;
  parking: string;
}
