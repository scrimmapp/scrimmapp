import type { MetadataRoute } from "next";
import { listOpenListings } from "@/db/queries";
import { siteUrl } from "@/lib/seo";

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
    { url: siteUrl, lastModified: new Date(), changeFrequency: "hourly", priority: 1 },
    ...staticRoutes.map((r) => ({
      url: `${siteUrl}${r.path}`,
      lastModified: new Date(),
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    })),
    ...listingEntries,
  ];
}
