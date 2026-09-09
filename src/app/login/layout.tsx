import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Log In | ScrimmApp",
  description: "Log in to your ScrimmApp coach account.",
  path: "/login",
  noIndex: true,
});

export default function LoginLayout({ children }: LayoutProps<"/login">) {
  return children;
}
