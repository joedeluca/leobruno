import CategoryLanding from "@/components/CategoryLanding"
import { getSortedPostsData } from "@/lib/posts"

export default function FieldNotesIndex() {
  const posts = getSortedPostsData().filter((p) => p.category === "Field Notes")
  return (
    <CategoryLanding
      label="Field Notes"
      items={posts.map((p) => ({ href: `/${p.slug}`, title: p.title }))}
    />
  )
}
