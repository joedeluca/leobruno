"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { gsap } from "gsap"
import GlobalSearch from "@/components/GlobalSearch"
import SpotifyEmbed from "@/components/SpotifyEmbed"
import { formatArticleDate } from "@/lib/formatDate"

interface Post {
  slug: string
  title: string
  date: string
  excerpt: string
  category: string
  tags?: string[]
  content?: string
  readTime?: string
  teaser?: string
  heroImage?: string
  heroImageSize?: "cover" | "contain" | "auto"
  heroImagePosition?: string
  heroImageHeight?: string
  heroContentStart?: string
  teaserFontSize?: string
  titleFontSize?: string
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

  // Split HTML on spotify-embed divs and render them as React components
  const spotifyPattern =
    /<div class="spotify-embed">[\s\S]*?<iframe[^>]+src="([^"]+)"[^>]*>[\s\S]*?<\/iframe>[\s\S]*?<\/div>/gi
  const renderContent = (html: string) => {
    const parts: React.ReactNode[] = []
    let lastIndex = 0
    let match: RegExpExecArray | null
    let i = 0
    spotifyPattern.lastIndex = 0
    while ((match = spotifyPattern.exec(html)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <span
            key={i++}
            dangerouslySetInnerHTML={{
              __html: html.slice(lastIndex, match.index),
            }}
          />
        )
      }
      parts.push(<SpotifyEmbed key={i++} src={match[1]} height={152} />)
      lastIndex = match.index + match[0].length
    }
    if (lastIndex < html.length) {
      parts.push(
        <span
          key={i++}
          dangerouslySetInnerHTML={{ __html: html.slice(lastIndex) }}
        />
      )
    }
    return parts
  }

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
          className={`max-w-5xl mx-auto px-8 ${
            showHeroImage ? "pb-12" : "py-12"
          } relative z-10`}
          style={{
            paddingTop: getContentPaddingTop(),
          }}
        >
          {/* Article header */}
          <header className="mb-12">
            <h5
              className="text-zinc-300 uppercase tracking-wide"
              style={{
                fontFamily: '"Graphik", system-ui, sans-serif',
                fontSize: post.teaserFontSize || "clamp(0.875rem, 2vw, 1.5rem)",
                textShadow:
                  "1px 1px 2px rgba(0,0,0,.24), 0 0 5px rgba(0,0,0,.24)",
              }}
            >
              <a
                href="/"
                className="text-zinc-300 hover:text-tiepolo-pink-700 transition-colors"
              >
                {post.category}
              </a>
              {" | "}
              {post.teaser}
            </h5>
            <h1
              className="text-zinc-300 mb-4 leading-tight mb-2 group-hover:text-white transition-colors font-bold"
              style={{
                fontFamily: '"Schnyder S", Georgia, serif',
                fontSize: post.titleFontSize || "clamp(2rem, 5vw, 4rem)",
                lineHeight: "1.2",
                textShadow:
                  "1px 1px 2px rgba(0,0,0,.24), 0 0 5px rgba(0,0,0,.24)",
              }}
            >
              {post.title}
            </h1>
            <div
              className="text-zinc-400"
              style={{
                fontSize: "clamp(1rem, 1.5vw, 1.25rem)",
              }}
            >
              <span style={{ fontFamily: '"Schnyder S", Georgia, serif' }}>
                by
              </span>{" "}
              <span style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}>
                Leo Bruno
              </span>{" "}
              | {formatArticleDate(post.date)}
            </div>
          </header>

          {/* Article content */}
          <article
            className="prose prose-zinc prose-lg max-w-none"
            style={{ fontSize: "clamp(1rem, 1.5vw, 1.25rem)" }}
          >
            {renderContent(post.content || "")}
          </article>
        </div>
      )}
    </div>
  )
}
