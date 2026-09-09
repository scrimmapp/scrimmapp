import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "FAQ | ScrimmApp Scrimmage Marketplace",
  description: "Answers about how quick-connect inquiries, the season calendar's conflict detection, listing management, and coach privacy work on ScrimmApp.",
  path: "/faq",
});

export default function FaqLayout({ children }: LayoutProps<"/faq">) {
  return children;
}
