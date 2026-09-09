import type { Metadata } from "next";

export const siteUrl = "https://scrimmapp.com";
export const siteName = "ScrimmApp";

export const defaultDescription =
  "The scrimmage marketplace and season planner for Rec, Club, High School, and Futsal soccer programs in Southern California. Post open match windows, filter by level and travel radius, and connect directly with the opposing coach.";

/**
 * Builds per-page metadata with a canonical URL and page-specific Open Graph tags. Without
 * this, every route inherits the root layout's single title and description, which reads to
 * a crawler as 16 near-duplicate pages.
 */
export function pageMetadata({
  title,
  description,
  path,
  noIndex = false,
}: {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
}): Metadata {
  const url = `${siteUrl}${path}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    // Utility and signed-in-only routes carry no search value and would just burn crawl
    // budget on pages that redirect to the login screen anyway.
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      url,
      siteName,
      type: "website",
      locale: "en_US",
      images: [{ url: "/brand/Scrimmapp_Meta.jpg", width: 1672, height: 941, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/brand/Scrimmapp_Meta.jpg"],
    },
  };
}

/**
 * Organization plus WebSite structured data for the root layout. Gives Google an explicit
 * name, logo, and social profile to attach to the brand rather than guessing from page text.
 */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: siteName,
        url: siteUrl,
        logo: `${siteUrl}/icon.png`,
        description: defaultDescription,
        areaServed: {
          "@type": "Place",
          name: "Southern California",
        },
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: siteName,
        description: defaultDescription,
        publisher: { "@id": `${siteUrl}/#organization` },
        inLanguage: "en-US",
      },
    ],
  };
}
