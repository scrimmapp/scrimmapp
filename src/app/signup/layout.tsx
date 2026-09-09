import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Sign Up | ScrimmApp",
  description: "Create a free ScrimmApp coach account to post scrimmage availability and connect with opposing coaches across Southern California.",
  path: "/signup",
});

export default function SignupLayout({ children }: LayoutProps<"/signup">) {
  return children;
}
