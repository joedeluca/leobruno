"use client"

import { useState, useEffect, useRef } from "react"
import Fuse from "fuse.js"
import { gsap } from "gsap"
import PostList from "@/components/PostList"
import Sidebar from "@/components/Sidebar"
import GlobalSearch from "@/components/GlobalSearch"
import HeaderSearchWrapper from "@/components/HeaderSearchWrapper"
import type { Post } from "@/lib/posts"

function extractMatchContext(text: string, query: string): string {
  if (!text || !query) return ""
  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  const matchIndex = lowerText.indexOf(lowerQuery)
  if (matchIndex === -1) return ""
  let start = matchIndex
  let end = matchIndex + query.length
  while (start > 0) {
    const char = text[start - 1]
    if (char === "." || char === "!" || char === "?") break
    start--
    if (matchIndex - start > 200) break
  }
  while (end < text.length) {
    const char = text[end]
    if (char === "." || char === "!" || char === "?") {
      end++
      break
    }
    end++
    if (end - matchIndex > 200) break
  }
  return text.slice(start, end).trim()
}

export default function HomeClient({ initialPosts }: { initialPosts: Post[] }) {
  const [posts] = useState<Post[]>(initialPosts)
  const [filteredPosts, setFilteredPosts] = useState<Post[]>(initialPosts)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchActive, setIsSearchActive] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  // Fade in on mount
  useEffect(() => {
    if (!hasAnimated.current && containerRef.current) {
      hasAnimated.current = true
      gsap.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: "power2.out" }
      )
    }

    // Notify sidebar of post count
    window.dispatchEvent(
      new CustomEvent("updatePostCount", { detail: { count: posts.length } })
    )

    // Clear any lingering search state
    const timer = setTimeout(() => {
      window.dispatchEvent(new CustomEvent("clearSearch"))
    }, 50)
    return () => clearTimeout(timer)
  }, [posts.length])

  // Ensure container stays visible when search toggles
  useEffect(() => {
    if (hasAnimated.current && containerRef.current) {
      gsap.set(containerRef.current, { opacity: 1 })
    }
  }, [isSearchActive])

  // Search handler with debounce
  useEffect(() => {
    let debounceTimer: NodeJS.Timeout

    const handleSearch = (event: Event) => {
      const customEvent = event as CustomEvent<{ query: string }>
      const query = customEvent.detail.query
      setSearchQuery(query)
      clearTimeout(debounceTimer)

      if (!query.trim()) {
        setFilteredPosts(posts)
        setIsSearchActive(false)
        window.dispatchEvent(
          new CustomEvent("updatePostCount", { detail: { count: posts.length } })
        )
        return
      }

      setIsSearchActive(true)

      debounceTimer = setTimeout(() => {
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
          if (result.matches) {
            const contentMatch = result.matches.find((m) => m.key === "content")
            if (contentMatch && post.content) {
              post.matchSnippet = extractMatchContext(post.content, query)
            }
          }
          return post
        })
        setFilteredPosts(filtered)
        window.dispatchEvent(
          new CustomEvent("updatePostCount", {
            detail: { count: filtered.length },
          })
        )
      }, 500)
    }

    window.addEventListener("searchQuery", handleSearch)
    return () => {
      window.removeEventListener("searchQuery", handleSearch)
      clearTimeout(debounceTimer)
    }
  }, [posts])

  return (
    <div ref={containerRef} className="w-full h-full opacity-0">
      {/* Search bar — sits above articles, below the header */}
      <div className="border-b border-zinc-800 h-14">
        <HeaderSearchWrapper />
      </div>

      {isSearchActive ? (
        <div className="px-8 pb-12 pt-[.8rem]">
          <GlobalSearch />
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row h-full">
          <div className="lg:w-3/4 w-full px-8 pb-12 pt-[.8rem] lg:pr-8 lg:border-r lg:border-zinc-800">
            <PostList posts={filteredPosts} searchQuery={searchQuery} />
          </div>
          <div className="lg:w-1/4 w-full px-10 pb-12 pt-[.8rem] lg:pl-10 mt-8 lg:mt-0">
            <Sidebar />
          </div>
        </div>
      )}
    </div>
  )
}
