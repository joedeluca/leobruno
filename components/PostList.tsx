"use client"

import Link from "next/link"
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
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500 text-2xl">Nada</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
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
              <div className="mb-0">
                <h5
                  className="text-zinc-500 uppercase tracking-wide mb-0"
                  style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
                >
                  {post.teaser && <>{post.teaser}</>}
                </h5>
              </div>

              <h2
                className="text-5xl leading-tight mb-2 group-hover:text-white transition-colors font-bold"
                style={{
                  fontFamily: '"Schnyder S", Georgia, serif',
                }}
              >
                {highlightText(post.title, searchQuery)}
              </h2>

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
