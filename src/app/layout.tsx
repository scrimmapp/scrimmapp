import type { Metadata } from "next";
import { Baloo_2, Public_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageTransition } from "@/components/page-transition";
import { RouteProgress } from "@/components/route-progress";
import { SiteBackground } from "@/components/ui/site-background";
import { ToastProvider } from "@/components/ui/toast";
import { PostHogProvider } from "@/components/monitoring/posthog-provider";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProfileById, listUnreadConnectionIds } from "@/db/queries";
import { initialsFrom } from "@/lib/format";
import { siteUrl, siteName, defaultDescription, organizationJsonLd } from "@/lib/seo";
import "./globals.css";

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const description = defaultDescription;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  // Only used as a fallback for a route with no metadata of its own; every real page below
  // sets its own full "Foo | ScrimmApp" title via src/lib/seo.ts's pageMetadata helper.
  title: "ScrimmApp | Post Your Team's Availability",
  description,
  keywords: [
    "soccer scrimmage",
    "youth soccer",
    "club soccer",
    "high school soccer",
    "futsal",
    "AYSO",
    "Southern California soccer",
    "scrimmage scheduling",
    "post soccer scrimmage",
    "find soccer scrimmage",
  ],
  openGraph: {
    title: "ScrimmApp | Post Your Team's Availability",
    description,
    url: siteUrl,
    siteName,
    images: [
      {
        url: "/brand/Scrimmapp_Meta.jpg",
        width: 1672,
        height: 941,
        alt: "ScrimmApp: post your team's availability",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ScrimmApp | Post Your Team's Availability",
    description,
    images: ["/brand/Scrimmapp_Meta.jpg"],
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  let coach: { name: string; initials: string; teamName: string } | null = null;
  let unreadCount = 0;

  if (user) {
    const profile = await getProfileById(user.id);
    if (profile) {
      coach = { name: profile.coachName, initials: initialsFrom(profile.coachName), teamName: profile.teamName };
    }
    unreadCount = (await listUnreadConnectionIds(user.id)).length;
  }

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${baloo.variable} ${publicSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
        <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false}>
          <PostHogProvider />
          <SiteBackground />
          <RouteProgress />
          <ToastProvider>
            <Navbar coach={coach} unreadCount={unreadCount} />
            <main className="flex-1 w-full">
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
