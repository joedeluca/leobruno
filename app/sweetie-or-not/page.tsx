import CategoryLanding from "@/components/CategoryLanding"
import { getSortedPostsData } from "@/lib/posts"

export default function SweetieOrNotIndex() {
  const posts = getSortedPostsData().filter((p) => p.category === "Sweetie or Not")
  return (
    <CategoryLanding
      label="Sweetie or Not"
      items={posts.map((p) => ({ href: `/${p.slug}`, title: p.title }))}
    />
  )
}
