"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { gsap } from "gsap"
import GlobalSearch from "@/components/GlobalSearch"

interface Post {
  slug: string
  title: string
  date: string
  excerpt: string
  category: string
  content?: string
  readTime?: string
  teaser?: string
}

export default function Post() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSearchActive, setIsSearchActive] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const slug = params.slug as string

    // Fetch the post data
    fetch(`/api/posts`)
      .then((res) => res.json())
      .then((data) => {
        const foundPost = data.posts.find((p: Post) => p.slug === slug)
        if (foundPost) {
          // Process the content to HTML
          fetch(`/api/post/${slug}`)
            .then((res) => res.json())
            .then((postData) => {
              setPost(postData)
              setLoading(false)
            })
            .catch(() => {
              // Fallback if individual post API doesn't exist
              setPost(foundPost)
              setLoading(false)
            })
        } else {
          router.push("/404")
        }
      })
      .catch(() => {
        setLoading(false)
      })

    // Clear search when article page mounts (after a small delay to ensure page is rendering)
    const timer = setTimeout(() => {
      window.dispatchEvent(new CustomEvent("clearSearch"))
    }, 50)

    return () => clearTimeout(timer)
  }, [params.slug, router])

  // Listen for search queries
  useEffect(() => {
    const handleSearchQuery = (event: Event) => {
      const customEvent = event as CustomEvent<{ query: string }>
      const searchQuery = customEvent.detail.query

      if (searchQuery.trim()) {
        setIsSearchActive(true)
      } else {
        setIsSearchActive(false)
      }
    }

    window.addEventListener("searchQuery", handleSearchQuery)
    return () => window.removeEventListener("searchQuery", handleSearchQuery)
  }, [])

  useEffect(() => {
    if (!loading && !hasAnimated.current && containerRef.current) {
      hasAnimated.current = true
      // Set initial opacity and fade in
      gsap.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: "power2.out" }
      )
    }
  }, [loading, post])

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tiepolo-pink-600"></div>
      </div>
    )
  }

  if (!post) {
    return null
  }

  return (
    <div ref={containerRef} className="w-full min-h-screen">
      {isSearchActive ? (
        <div className="px-8 pb-12 pt-[.8rem]">
          <GlobalSearch />
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-8 py-12">
          {/* Article header */}
          <header className="mb-12">
            <h5
              className="text-zinc-300 uppercase tracking-wide mb-4 text-xl"
              style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
            >
              {post.teaser}
            </h5>
            <h1
              className="text-zinc-300 mb-6"
              style={{
                fontFamily: '"Schnyder S", Georgia, serif',
              }}
            >
              {post.title}
            </h1>
          </header>

          {/* Article content */}
          <article
            className="prose prose-zinc prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content || "" }}
          />
        </div>
      )}
    </div>
  )
}
