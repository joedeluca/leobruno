import type { MetadataRoute } from "next"
import { getSortedPostsData } from "@/lib/posts"
import { getAllPoems } from "@/lib/poems"
import { getAllNewsletterIssues } from "@/lib/newsletter"
import { getAllCopywriterProjects } from "@/lib/copywriter"

const BASE_URL = "https://leobruno.it"

/**
 * Frontmatter dates are hand-written and occasionally missing or malformed.
 * An Invalid Date serializes to null and Google drops the whole <url> entry,
 * so anything unparseable falls back to the build time.
 */
function lastModified(date?: string): Date {
  if (!date) return new Date()
  const parsed = new Date(date)
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed
}

/**
 * Routes deliberately absent: /account, /auth/confirm, /welcome and
 * /subscribed are per-user or post-action states with nothing to index.
 * They are disallowed in robots.ts to match. /magazine/[slug] is omitted
 * until that route ships.
 */
const STATIC_ROUTES: {
  path: string
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]
  priority: number
}[] = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/work", changeFrequency: "monthly", priority: 0.8 },
  { path: "/essays", changeFrequency: "weekly", priority: 0.7 },
  { path: "/fiction", changeFrequency: "weekly", priority: 0.7 },
  { path: "/poems", changeFrequency: "weekly", priority: 0.7 },
  { path: "/poetics", changeFrequency: "monthly", priority: 0.6 },
  { path: "/field-notes", changeFrequency: "weekly", priority: 0.6 },
  { path: "/marginalia", changeFrequency: "weekly", priority: 0.6 },
  { path: "/newsletter", changeFrequency: "weekly", priority: 0.6 },
  { path: "/copywriter", changeFrequency: "monthly", priority: 0.6 },
  { path: "/sweetie-or-not", changeFrequency: "monthly", priority: 0.4 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${BASE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  // Posts live at the root: /[slug]
  const posts: MetadataRoute.Sitemap = getSortedPostsData().map((post) => ({
    url: `${BASE_URL}/${post.slug}`,
    lastModified: lastModified(post.date),
    changeFrequency: "monthly",
    priority: 0.9,
  }))

  const poems: MetadataRoute.Sitemap = getAllPoems().map((poem) => ({
    url: `${BASE_URL}/poems/${poem.slug}`,
    lastModified: lastModified(poem.date),
    changeFrequency: "yearly",
    priority: 0.6,
  }))

  const newsletter: MetadataRoute.Sitemap = getAllNewsletterIssues().map(
    (issue) => ({
      url: `${BASE_URL}/newsletter/${issue.slug}`,
      lastModified: lastModified(issue.date),
      changeFrequency: "yearly",
      priority: 0.5,
    })
  )

  const copywriter: MetadataRoute.Sitemap = getAllCopywriterProjects().map(
    (project) => ({
      url: `${BASE_URL}/copywriter/${project.slug}`,
      lastModified: lastModified(project.date),
      changeFrequency: "yearly",
      priority: 0.5,
    })
  )

  return [...staticPages, ...posts, ...poems, ...newsletter, ...copywriter]
}
