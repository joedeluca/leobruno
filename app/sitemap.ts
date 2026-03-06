import type { MetadataRoute } from "next"
import { getSortedPostsData } from "@/lib/posts"
import { getAllPoems } from "@/lib/poems"

const BASE_URL = "https://leobruno.it"

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getSortedPostsData()
  const poems = getAllPoems()

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/work`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/poems`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/newsletter`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ]

  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/${post.slug}`,
    lastModified: post.date,
    changeFrequency: "monthly",
    priority: 0.9,
  }))

  const poemPages: MetadataRoute.Sitemap = poems.map((poem) => ({
    url: `${BASE_URL}/poems/${poem.slug}`,
    changeFrequency: "yearly",
    priority: 0.5,
  }))

  return [...staticPages, ...postPages, ...poemPages]
}
