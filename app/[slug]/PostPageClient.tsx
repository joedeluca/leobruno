"use client"

import { useEffect, useState, useRef } from "react"
import { gsap } from "gsap"
import GlobalSearch from "@/components/GlobalSearch"
import SpotifyEmbed from "@/components/SpotifyEmbed"
import { formatArticleDate, formatShortDate } from "@/lib/formatDate"
import PostReadTracker from "./PostReadTracker"
import ArticleTrace, { TraceButton } from "@/components/ArticleTrace"
import type { Post } from "@/lib/posts"

const spotifyPattern =
  /<div class="spotify-embed">[\s\S]*?<iframe[^>]+src="([^"]+)"[^>]*>[\s\S]*?<\/iframe>[\s\S]*?<\/div>/gi

function renderContent(html: string) {
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

export default function PostPageClient({ post }: { post: Post }) {
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [traceOpen, setTraceOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Fade in on mount
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: "power2.out" }
      )
    }
    // Clear any active search state when the article mounts
    const timer = setTimeout(() => {
      window.dispatchEvent(new CustomEvent("clearSearch"))
    }, 50)
    return () => clearTimeout(timer)
  }, [])

  // Listen for search queries
  useEffect(() => {
    const handleSearchQuery = (event: Event) => {
      const customEvent = event as CustomEvent<{ query: string }>
      setIsSearchActive(!!customEvent.detail.query.trim())
    }
    window.addEventListener("searchQuery", handleSearchQuery)
    return () => window.removeEventListener("searchQuery", handleSearchQuery)
  }, [])

  const showHeroImage = !!post.heroImage

  const getContentPaddingTop = () => {
    if (!showHeroImage) return undefined
    if (post.heroContentStart) return post.heroContentStart
    const height = post.heroImageHeight || "96vh"
    return `calc(${height} - 35vh)`
  }

  return (
    <div
      ref={containerRef}
      className="w-full min-h-screen"
    >
      <PostReadTracker
        slug={post.slug}
        title={post.title}
        type={
          post.category?.toLowerCase() === "newsletter" ? "newsletter" : "post"
        }
        url={`/${post.slug}`}
      />

      {/* Hero Image — container negates main's pt-28 so it starts at y=0.
           Hero uses absolute top:7rem (= h-28) so it always locks to header bottom,
           independent of any parent padding. */}
      {showHeroImage && post.heroImage && (
        <div
          className="w-full relative"
          style={{ height: post.heroImageHeight || "96vh" }}
        >
          <img
            src={post.heroImage}
            alt=""
            className="absolute inset-0 w-full h-full"
            style={{
              objectFit: (post.heroImageSize as React.CSSProperties['objectFit']) || 'cover',
              objectPosition: post.heroImagePosition || 'center',
            }}
          />
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
            paddingTop: showHeroImage ? '3rem' : getContentPaddingTop(),
          }}
        >
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
              className="text-zinc-300 mb-4 leading-tight group-hover:text-white transition-colors font-bold"
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
              className="text-zinc-400 flex items-center gap-3"
              style={{ fontSize: "clamp(1rem, 1.5vw, 1.25rem)" }}
            >
              <span style={{ fontFamily: '"Schnyder S", Georgia, serif' }}>
                by
              </span>{" "}
              <span className="lg:hidden" style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}>
                Leo
              </span>
              <span className="hidden lg:inline" style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}>
                Leo Bruno
              </span>{" "}
              <span className="lg:hidden">| {formatShortDate(post.date)}</span>
              <span className="hidden lg:inline">| {formatArticleDate(post.date)}</span>
              <span className="text-zinc-800 select-none">·</span>
              <TraceButton onClick={() => setTraceOpen((v) => !v)} isOpen={traceOpen} />
            </div>
          </header>

          <article
            className="prose prose-zinc prose-lg max-w-none"
            style={{ fontSize: "clamp(1rem, 1.5vw, 1.25rem)" }}
          >
            {post.category === "Sweetie or Not" && (
              <img
                src="/sweetie-sticker.svg"
                alt="Sweetie or Not"
                className="float-right w-48 h-48 lg:w-72 lg:h-72 pointer-events-none select-none ml-6 mb-4"
                style={{ transform: "rotate(8deg)" }}
              />
            )}
            {renderContent(post.content || "")}
          </article>

          <ArticleTrace
            filePath={`posts/${post.slug}`}
            currentContent={post.rawContent || ""}
            isOpen={traceOpen}
            onToggle={() => setTraceOpen((v) => !v)}
          />
        </div>
      )}
    </div>
  )
}
