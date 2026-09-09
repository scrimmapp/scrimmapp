import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Reset Password | ScrimmApp",
  description: "Set a new password for your ScrimmApp account.",
  path: "/reset-password",
  noIndex: true,
});

export default function ResetPasswordLayout({ children }: LayoutProps<"/reset-password">) {
  return children;
}
