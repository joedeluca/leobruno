import type { MetadataRoute } from "next"

const BASE_URL = "https://leobruno.it"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/account",
          "/auth/",
          "/welcome",
          "/subscribed",
          // Print dress of /magazine/[slug] — same words, no reader chrome.
          "/magazine/*/print",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  }
}
