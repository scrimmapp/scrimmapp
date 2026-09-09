import { redirect } from "next/navigation";

// The public landing page is the board: the post-a-scrimmage form front and center for both
// visitors and signed-in coaches, per Javi's Sep 2026 request. It used to bounce straight to
// /login, which meant a first-time visitor never saw the product before being asked to sign up.
export default function RootPage() {
  redirect("/board");
}
