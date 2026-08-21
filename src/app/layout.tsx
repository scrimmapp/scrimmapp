import type { Metadata } from "next";
import { Baloo_2, Public_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageTransition } from "@/components/page-transition";
import { RouteProgress } from "@/components/route-progress";
import { SiteBackground } from "@/components/ui/site-background";
import { ToastProvider } from "@/components/ui/toast";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProfileById, listUnreadConnectionIds } from "@/db/queries";
import { initialsFrom } from "@/lib/format";
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

export const metadata: Metadata = {
  title: "ScrimmApp | Find Your Next Scrimmage",
  description:
    "The scrimmage marketplace and season planner for Rec, Club, and High School soccer programs.",
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
        <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false}>
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
