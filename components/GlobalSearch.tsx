"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { gsap } from "gsap"
import { formatDate } from "@/lib/formatDate"

interface Post {
  slug: string
  title: string
  titleShort?: string
  date: string
  excerpt?: string
  teaser?: string
  teaserShort?: string
  content?: string
  matchSnippet?: string
}

// Helper function to strip HTML tags and decode entities
function stripHtml(html: string): string {
  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, " ")
  // Decode common HTML entities
  text = text.replace(/&nbsp;/g, " ")
  text = text.replace(/&amp;/g, "&")
  text = text.replace(/&lt;/g, "<")
  text = text.replace(/&gt;/g, ">")
  text = text.replace(/&quot;/g, '"')
  // Remove extra whitespace
  text = text.replace(/\s+/g, " ").trim()
  return text
}

// Helper function to highlight search query in text
function highlightText(text: string, query: string) {
  if (!query.trim()) return text

  // Use word boundary regex to match whole words only
  const regex = new RegExp(`\\b(${query})\\b`, "gi")
  const parts = text.split(regex)

  return parts.map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <span key={index} className="highlight">
        {part}
      </span>
    ) : (
      part
    )
  )
}

// Helper function to extract context around a match
function extractMatchContext(text: string, query: string): string {
  if (!text || !query) return ""

  // Escape special regex characters in the query
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

  // For multi-word queries, match the phrase as-is
  // For single words, use word boundaries
  const regex = query.includes(" ")
    ? new RegExp(escapedQuery, "i")
    : new RegExp(`\\b${escapedQuery}\\b`, "i")

  const match = regex.exec(text)

  if (!match) return ""

  const index = match.index

  // Extract ~150 characters before and after
  const start = Math.max(0, index - 150)
  const end = Math.min(text.length, index + query.length + 150)

  let snippet = text.slice(start, end)

  // Add ellipsis if needed
  if (start > 0) snippet = "..." + snippet
  if (end < text.length) snippet = snippet + "..."

  return snippet.trim()
}

export default function GlobalSearch() {
  const [query, setQuery] = useState("")
  const [posts, setPosts] = useState<Post[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const resultsRef = useRef<HTMLDivElement>(null)

  // Fetch all posts on mount
  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => setPosts(data.posts || data))
  }, [])

  // Listen for search queries from header
  useEffect(() => {
    const handleSearchQuery = (event: Event) => {
      const customEvent = event as CustomEvent<{ query: string }>
      const searchQuery = customEvent.detail.query
      setQuery(searchQuery)

      if (searchQuery.trim()) {
        setIsSearching(true)
      } else {
        setIsSearching(false)
      }
    }

    const handleClearSearch = () => {
      setQuery("")
      setIsSearching(false)
      setFilteredPosts([])
    }

    window.addEventListener("searchQuery", handleSearchQuery)
    window.addEventListener("clearSearch", handleClearSearch)

    return () => {
      window.removeEventListener("searchQuery", handleSearchQuery)
      window.removeEventListener("clearSearch", handleClearSearch)
    }
  }, [pathname, router])

  // Filter posts based on query
  useEffect(() => {
    if (!query.trim()) {
      setFilteredPosts([])
      setIsSearching(false)
      // Dispatch event to show all posts
      window.dispatchEvent(
        new CustomEvent("updatePostCount", { detail: { count: posts.length } })
      )
      return
    }

    const filtered: Post[] = []

    for (const post of posts) {
      // Strip HTML from content for searching
      const cleanContent = post.content ? stripHtml(post.content) : ""

      // Create fresh regex for each test to avoid lastIndex issues
      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

      // For multi-word queries, match the phrase as-is
      // For single words, use word boundaries
      const searchRegex = query.includes(" ")
        ? new RegExp(escapedQuery, "i")
        : new RegExp(`\\b${escapedQuery}\\b`, "i")

      const titleMatch = searchRegex.test(post.title)
      const excerptMatch = post.excerpt ? searchRegex.test(post.excerpt) : false
      const teaserMatch = post.teaser ? searchRegex.test(post.teaser) : false
      const contentMatch = cleanContent ? searchRegex.test(cleanContent) : false

      if (titleMatch || excerptMatch || teaserMatch || contentMatch) {
        // Always prioritize showing where the actual match was found
        let matchSnippet = ""

        // Priority: show the actual location of the match
        // 1. If matched in content, always extract the snippet from content (best context)
        if (contentMatch && cleanContent) {
          matchSnippet = extractMatchContext(cleanContent, query)

          // If extraction failed, fall back to other fields
          if (!matchSnippet) {
            if (excerptMatch && post.excerpt) {
              matchSnippet = post.excerpt
            } else if (teaserMatch && post.teaser) {
              matchSnippet = post.teaser
            } else {
              matchSnippet = post.excerpt || ""
            }
          }
        }
        // 2. If matched in teaser, show teaser
        else if (teaserMatch && post.teaser) {
          matchSnippet = post.teaser
        }
        // 3. If matched in excerpt, show excerpt
        else if (excerptMatch && post.excerpt) {
          matchSnippet = post.excerpt
        }
        // 4. If matched in title only, show excerpt as fallback
        else if (titleMatch && post.excerpt) {
          matchSnippet = post.excerpt
        }
        // 5. Last resort fallback
        else {
          matchSnippet = post.excerpt || ""
        }

        filtered.push({ ...post, matchSnippet })
      }
    }

    setFilteredPosts(filtered)
    setIsSearching(true)

    // Update count in header
    window.dispatchEvent(
      new CustomEvent("updatePostCount", { detail: { count: filtered.length } })
    )

    // Animate results in
    if (resultsRef.current && filtered.length > 0) {
      const items = resultsRef.current.querySelectorAll(".search-result-item")
      gsap.fromTo(
        items,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.08,
          ease: "power2.out",
        }
      )
    }
  }, [query, posts])

  if (!isSearching) return null

  return (
    <div ref={resultsRef} className="w-full">
      {filteredPosts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-zinc-500 text-xl">
            No articles found for "{query}"
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <Link
              key={`${post.slug}-${query}`}
              href={`/${post.slug}`}
              className="search-result-item group"
            >
              <article className="h-full p-8 bg-zinc-900 hover:bg-zinc-800 transition-colors rounded-lg border border-zinc-800">
                <h2 className="text-2xl font-bold text-zinc-100 mb-3 group-hover:text-white transition-colors">
                  {highlightText(post.titleShort || post.title, query)}
                </h2>
                <p className="text-sm text-zinc-500 mb-4">
                  {formatDate(post.date)}
                </p>
                {post.matchSnippet && (
                  <p
                    key={`snippet-${
                      post.slug
                    }-${query}-${post.matchSnippet.substring(0, 20)}`}
                    className="text-lg text-zinc-400 line-clamp-5"
                  >
                    {highlightText(post.matchSnippet, query)}
                  </p>
                )}
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
