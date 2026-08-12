import type { Metadata } from "next";
import { Baloo_2, Public_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AppDataProvider } from "@/lib/app-data";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${baloo.variable} ${publicSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
          <AppDataProvider>
            <Navbar />
            <main className="flex-1 w-full">{children}</main>
            <Footer />
          </AppDataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
