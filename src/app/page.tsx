import type { Metadata } from "next";
import { BoardPageContent } from "./board/page";
import { pageMetadata } from "@/lib/seo";

// Renders the board directly instead of redirect()-ing to it: see the comment on
// BoardPageContent in ./board/page.tsx for why the redirect was a real performance cost.
// Canonical still points at /board (the URL every nav link, the sitemap, and robots.txt treat
// as the real one) so Google indexes one page, not two identical URLs.
export const metadata: Metadata = pageMetadata({
  title: "Soccer Scrimmage Board | Post & Find Matches in Southern California",
  description:
    "Browse open soccer scrimmages across Southern California or post your team's availability in minutes. Filter by Rec, Club, High School, or Futsal, gender, age group, and travel radius.",
  path: "/board",
});

export default function RootPage() {
  return <BoardPageContent />;
}
