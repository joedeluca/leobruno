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
  heroImage?: string
  heroImageSize?: "cover" | "contain" | "auto"
  heroImagePosition?: string
  heroImageHeight?: string
  heroContentStart?: string
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

  const showHeroImage = !!post.heroImage

  // Calculate content start position
  const getContentPaddingTop = () => {
    if (!showHeroImage) return undefined

    // Use explicit heroContentStart if provided
    if (post.heroContentStart) {
      return post.heroContentStart
    }

    // Otherwise calculate: imageHeight - 20vh for overlap with gradient
    const height = post.heroImageHeight || "60vh"
    return `calc(${height} - 20vh)`
  }

  return (
    <div ref={containerRef} className="w-full min-h-screen relative">
      {/* Hero Image - Shows when heroImage is set in markdown frontmatter */}
      {showHeroImage && post.heroImage && (
        <div
          className="absolute top-0 left-0 w-full"
          style={{
            height: post.heroImageHeight || "60vh",
            backgroundImage: `url(${post.heroImage})`,
            backgroundSize: post.heroImageSize || "cover",
            backgroundPosition: post.heroImagePosition || "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/50 to-zinc-950" />
        </div>
      )}

      {isSearchActive ? (
        <div className="px-8 pb-12 pt-[.8rem] relative z-10">
          <GlobalSearch />
        </div>
      ) : (
        <div
          className={`max-w-4xl px-8 lg:px-0 lg:ml-[calc(theme(spacing.8)*2+12ch+theme(spacing.6))] lg:mr-8 ${
            showHeroImage ? "pb-12" : "py-12"
          } relative z-10`}
          style={{
            paddingTop: getContentPaddingTop(),
          }}
        >
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
