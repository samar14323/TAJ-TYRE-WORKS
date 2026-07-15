import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tajtyreworks.com";
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/login", "/customer/stock", "/track", "/workshop-tv"],
      disallow: ["/owner/", "/employee/", "/customer/", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
