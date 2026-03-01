"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Post } from "@/lib/posts"

interface PostListProps {
  posts: Post[]
  searchQuery: string
}

function highlightText(text: string, query: string) {
  if (!query) return text

  // Escape special regex characters in the query
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const regex = new RegExp(`(${escapedQuery})`, "gi")
  const parts = text.split(regex)

  return parts.map((part, index) => {
    // Check if this part matches the query (case-insensitive)
    if (part.toLowerCase() === query.toLowerCase()) {
      return (
        <span key={index} className="highlight">
          {part}
        </span>
      )
    }
    return part
  })
}

export default function PostList({ posts, searchQuery }: PostListProps) {
  const router = useRouter()
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500 text-2xl">Nada</p>
      </div>
    )
  }

  return (
    <div className="space-y-28">
      {/* Pinned Message
      <div className="p-4 bg-zinc-900/30">
        <p
          className="text-zinc-400 leading-relaxed"
          style={{ fontSize: "clamp(1rem, 1.5vw, 1.125rem)" }}
        >
          Nothing here is AI generated. It's all the work of one human mind
          working in isolation on an island in the middle of the Mediterranean
          sea.
        </p>
      </div> */}

      {posts.map((post) => {
        // Determine the correct URL based on slug
        const postUrl = post.slug.startsWith("fragments/")
          ? `/${post.slug}` // fragments/tommy-lee -> /fragments/tommy-lee
          : `/${post.slug}` // easy-tommy-lee -> /easy-tommy-lee

        return (
          <article key={post.slug}>
            <Link
              href={postUrl}
              className="group block hover:bg-zinc-900/50 -mx-4 px-4 py-4 rounded-lg transition-colors"
            >
              {/* Category | Teaser */}
              <div className="mb-3">
                <h5
                  className="text-zinc-300 uppercase tracking-wide mb-0 flex"
                  style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
                >
                  <button
                    type="button"
                    className="uppercase text-zinc-300 hover:text-tiepolo-pink-700 transition-colors cursor-pointer"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push("/") }}
                  >
                    {post.category}
                  </button>&nbsp;{"|"}&nbsp;{post.teaserShort || post.teaser}
                </h5>
              </div>

              <h1
                className="leading-tight mb-2 group-hover:text-white transition-colors font-bold"
                style={{
                  fontFamily: '"Schnyder S", Georgia, serif',
                }}
              >
                {/* Show short title on mobile, full title on desktop */}
                <span className="lg:hidden">
                  {highlightText(post.titleShort || post.title, searchQuery)}
                </span>
                <span className="hidden lg:inline">
                  {highlightText(post.title, searchQuery)}
                </span>
              </h1>

              {/* Show match snippet if searching and content was matched */}
              {post.matchSnippet && searchQuery ? (
                <p className="!mt-0 text-2xl leading-relaxed text-zinc-500 italic">
                  ...{highlightText(post.matchSnippet, searchQuery)}...
                </p>
              ) : (
                <p className="text-2xl leading-relaxed text-zinc-500">
                  {highlightText(post.excerpt, searchQuery)}
                </p>
              )}
            </Link>
          </article>
        )
      })}
    </div>
  )
}
