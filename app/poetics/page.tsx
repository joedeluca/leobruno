import CategoryLanding from "@/components/CategoryLanding"
import { getSortedPostsData } from "@/lib/posts"

export default function PoeticsIndex() {
  const posts = getSortedPostsData().filter((p) => p.category === "Poetics")
  return (
    <CategoryLanding
      label="Poetics"
      items={posts.map((p) => ({ href: `/${p.slug}`, title: p.title }))}
    />
  )
}
