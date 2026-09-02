import type { Metadata } from "next"
import CategoryLanding from "@/components/CategoryLanding"
import { getSortedPostsData } from "@/lib/posts"

export const metadata: Metadata = {
  title: "Marginalia",
  description: "Short notes and observations by Leo Bruno.",
  alternates: { canonical: "https://leobruno.it/marginalia" },
}

export default function MarginaliaPage() {
  const posts = getSortedPostsData().filter(p => p.category === "Marginalia")
  const items = posts.map(p => ({ href: `/${p.slug}`, title: p.title }))
  return <CategoryLanding label="Marginalia" items={items} />
}
