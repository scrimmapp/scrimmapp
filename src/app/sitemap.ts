import type { MetadataRoute } from "next";
import { listOpenListings } from "@/db/queries";
import { siteUrl } from "@/lib/seo";

// Without this, Next treats sitemap.ts as statically prerenderable and runs the DB query at
// *build* time, not request time. Both CI and the Docker build stage use a placeholder
// DATABASE_URL (no real database is reachable then), so that query fails with ECONNREFUSED
// and takes the whole build down with it. Forcing dynamic rendering defers the query to a real
// request against Cloud Run, where the real DB secret is actually injected.
export const dynamic = "force-dynamic";

const staticRoutes: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
  { path: "/board", changeFrequency: "hourly", priority: 1 },
  { path: "/about", changeFrequency: "monthly", priority: 0.6 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.6 },
  { path: "/venues", changeFrequency: "weekly", priority: 0.5 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/login", changeFrequency: "yearly", priority: 0.2 },
  { path: "/signup", changeFrequency: "yearly", priority: 0.4 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const openListings = await listOpenListings();

  const listingEntries: MetadataRoute.Sitemap = openListings.map((listing) => ({
    url: `${siteUrl}/listings/${listing.id}`,
    lastModified: listing.createdAt,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [
    // No separate entry for the bare domain: it renders the same content as /board and
    // declares /board as its canonical, so listing both here would just be duplicate URLs.
    ...staticRoutes.map((r) => ({
      url: `${siteUrl}${r.path}`,
      lastModified: new Date(),
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    })),
    ...listingEntries,
  ];
}
