import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Every account/auth-only route: nothing here is content a search result should land
      // a stranger on, since it just redirects to /login.
      disallow: [
        "/calendar",
        "/posts",
        "/inbox",
        "/inbox/*",
        "/profile",
        "/reset-password",
        "/api/*",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
