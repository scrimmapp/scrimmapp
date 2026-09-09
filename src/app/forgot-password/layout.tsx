import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Forgot Password | ScrimmApp",
  description: "Reset your ScrimmApp account password.",
  path: "/forgot-password",
  noIndex: true,
});

export default function ForgotPasswordLayout({ children }: LayoutProps<"/forgot-password">) {
  return children;
}
