"use client"

import { useState, useEffect } from "react"
import Fuse from "fuse.js"
import PostList from "@/components/PostList"
import Sidebar from "@/components/Sidebar"
import type { Post } from "@/lib/posts"

// Extract context around the matched text
function extractMatchContext(text: string, query: string): string {
  if (!text || !query) return ""

  // Find the position of the match (case-insensitive)
  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  const matchIndex = lowerText.indexOf(lowerQuery)

  if (matchIndex === -1) return ""

  // Find sentence boundaries around the match
  // Look for periods, exclamation marks, or question marks
  let start = matchIndex
  let end = matchIndex + query.length

  // Expand backwards to find start of sentence (or beginning of text)
  while (start > 0) {
    const char = text[start - 1]
    if (char === "." || char === "!" || char === "?") {
      break
    }
    start--
    // Safety limit: don't go back more than 200 characters
    if (matchIndex - start > 200) break
  }

  // Expand forwards to find end of sentence (or end of text)
  while (end < text.length) {
    const char = text[end]
    if (char === "." || char === "!" || char === "?") {
      end++
      break
    }
    end++
    // Safety limit: don't go forward more than 200 characters
    if (end - matchIndex > 200) break
  }

  // Trim whitespace and return
  return text.slice(start, end).trim()
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch posts from API
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data.posts)
        setFilteredPosts(data.posts)
        setIsLoading(false)

        // Update header with initial post count
        const event = new CustomEvent("updatePostCount", {
          detail: { count: data.posts.length },
        })
        window.dispatchEvent(event)
      })
      .catch((error) => {
        console.error("Error fetching posts:", error)
        setIsLoading(false)
      })
  }, [])

  // Listen for search events from header with debounce
  useEffect(() => {
    let debounceTimer: NodeJS.Timeout

    const handleSearch = (event: Event) => {
      const customEvent = event as CustomEvent<{ query: string }>
      const query = customEvent.detail.query

      // Store the raw query for highlighting, but don't filter yet
      setSearchQuery(query)

      // Clear existing timer
      clearTimeout(debounceTimer)

      // If query is empty, show all posts immediately
      if (!query.trim()) {
        setDebouncedQuery("")
        setFilteredPosts(posts)
        // Update count
        const countEvent = new CustomEvent("updatePostCount", {
          detail: { count: posts.length },
        })
        window.dispatchEvent(countEvent)
        return
      }

      // Keep showing all posts while user is typing
      // Only filter after they stop typing for 500ms
      debounceTimer = setTimeout(() => {
        setDebouncedQuery(query)

        const fuse = new Fuse(posts, {
          keys: ["title", "excerpt", "category", "content"],
          threshold: 0.15,
          ignoreLocation: true,
          minMatchCharLength: 1,
          includeMatches: true,
        })

        const results = fuse.search(query)
        const filtered = results.map((result) => {
          const post = { ...result.item }

          // If content was matched, extract context snippet
          if (result.matches) {
            const contentMatch = result.matches.find((m) => m.key === "content")
            if (contentMatch && post.content) {
              post.matchSnippet = extractMatchContext(post.content, query)
            }
          }

          return post
        })

        setFilteredPosts(filtered)

        // Update count
        const countEvent = new CustomEvent("updatePostCount", {
          detail: { count: filtered.length },
        })
        window.dispatchEvent(countEvent)
      }, 500)
    }

    window.addEventListener("searchQuery", handleSearch)

    return () => {
      window.removeEventListener("searchQuery", handleSearch)
      clearTimeout(debounceTimer)
    }
  }, [posts])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tiepolo-pink-800"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <div className="flex flex-col lg:flex-row h-full">
        {/* Main Content - 75% on desktop */}
        <div className="lg:w-3/4 w-full px-8 pb-12 pt-[.8rem]">
          <PostList posts={filteredPosts} searchQuery={searchQuery} />
        </div>

        {/* Sidebar - 25% on desktop (reduced by 30%) */}
        <div className="lg:w-1/4 w-full lg:border-l lg:border-zinc-800 px-8 pb-12">
          <div className="lg:sticky lg:top-[7rem]">
            <Sidebar />
          </div>
        </div>
      </div>
    </div>
  )
}
