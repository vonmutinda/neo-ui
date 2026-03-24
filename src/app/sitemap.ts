import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://enviar.app";

  return [
    { url: `${baseUrl}/login`, lastModified: new Date(), priority: 1 },
    { url: `${baseUrl}/register`, lastModified: new Date(), priority: 0.8 },
  ];
}
