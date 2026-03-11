import type { Metadata } from "next"
import { getSortedPostsData } from "@/lib/posts"
import EssaysClient from "./EssaysClient"
import type { EssayItem } from "./EssaysClient"

export const metadata: Metadata = {
  title: "Essays",
  description:
    "Essays, criticism, and field notes by Leo Bruno.",
  alternates: {
    canonical: "https://leobruno.it/essays",
  },
  openGraph: {
    title: "Essays — Leo Bruno",
    description: "Essays, criticism, and field notes by Leo Bruno.",
    url: "https://leobruno.it/essays",
    type: "website",
  },
}

export default function EssaysPage() {
  const posts = getSortedPostsData()

  const items: EssayItem[] = posts
    .filter(p => p.category !== "Fiction" && p.category !== "Poetry" && p.category !== "Poem")
    .map(p => ({
      slug: p.slug,
      title: p.title,
      date: p.date,
      category: p.category,
      href: `/${p.slug}`,
    }))

  return <EssaysClient initialItems={items} />
}
