import { getSortedPostsDataWithContent } from "@/lib/posts"
import HomeClient from "./HomeClient"

export default function Home() {
  const posts = getSortedPostsDataWithContent()
  return <HomeClient initialPosts={posts} />
}
