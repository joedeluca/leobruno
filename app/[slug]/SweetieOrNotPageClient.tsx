"use client"

import { useEffect, useState, useRef } from "react"
import { gsap } from "gsap"
import GlobalSearch from "@/components/GlobalSearch"
import SpotifyEmbed from "@/components/SpotifyEmbed"
import { formatArticleDate } from "@/lib/formatDate"
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

const UPCOMING = ["Woody Allen", "Arnold Schwarzenegger"]

export default function SweetieOrNotPageClient({ post }: { post: Post }) {
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [traceOpen, setTraceOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: "power2.out" }
      )
    }
    const timer = setTimeout(() => {
      window.dispatchEvent(new CustomEvent("clearSearch"))
    }, 50)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleSearchQuery = (event: Event) => {
      const customEvent = event as CustomEvent<{ query: string }>
      setIsSearchActive(!!customEvent.detail.query.trim())
    }
    window.addEventListener("searchQuery", handleSearchQuery)
    return () => window.removeEventListener("searchQuery", handleSearchQuery)
  }, [])

  return (
    <div ref={containerRef} className="w-full min-h-screen relative">
      <PostReadTracker
        slug={post.slug}
        title={post.title}
        type="post"
        url={`/${post.slug}`}
      />

      {isSearchActive ? (
        <div className="px-8 pb-12 pt-[.8rem] relative z-10">
          <GlobalSearch />
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row h-full">
          {/* Col 1 — headline + article */}
          <div className="lg:w-3/4 w-full px-8 pb-12 pt-12 lg:pr-8 lg:border-r lg:border-zinc-800">
            <header className="mb-12">
              <h5
                className="text-zinc-300 uppercase tracking-wide"
                style={{
                  fontFamily: '"Graphik", system-ui, sans-serif',
                  fontSize: post.teaserFontSize || "clamp(0.875rem, 2vw, 1.5rem)",
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
                className="text-zinc-300 mb-4 leading-tight font-bold"
                style={{
                  fontFamily: '"Schnyder S", Georgia, serif',
                  fontSize: post.titleFontSize || "clamp(2rem, 5vw, 4rem)",
                  lineHeight: "1.2",
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
                <span style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}>
                  Leo Bruno
                </span>{" "}
                | {formatArticleDate(post.date)}
                <span className="text-zinc-800 select-none">·</span>
                <TraceButton
                  onClick={() => setTraceOpen((v) => !v)}
                  isOpen={traceOpen}
                />
              </div>
            </header>

            <article
              className="prose prose-zinc prose-lg max-w-none"
              style={{ fontSize: "clamp(1rem, 1.5vw, 1.25rem)" }}
            >
              <img
                src="/sweetie-sticker.svg"
                alt="Sweetie or Not"
                className="lg:hidden not-prose float-right pointer-events-none select-none"
                style={{
                  width: "clamp(10rem, 40vw, 14rem)",
                  height: "clamp(10rem, 40vw, 14rem)",
                  marginLeft: "1rem",
                  marginBottom: "0.5rem",
                  transform: "rotate(8deg)",
                }}
              />
              {renderContent(post.content || "")}
            </article>

            <ArticleTrace
              filePath={`posts/${post.slug}`}
              currentContent={post.rawContent || ""}
              isOpen={traceOpen}
              onToggle={() => setTraceOpen((v) => !v)}
            />
          </div>

          {/* Col 2 — verdict, sticker, coming up */}
          <aside className="lg:w-1/4 w-full px-8 pb-12 pt-12 lg:pl-8 mt-8 lg:mt-0">
            <div className="lg:sticky lg:top-12 space-y-8">
              {/* Verdict */}
              <div>
                <p
                  className="text-zinc-500 uppercase tracking-widest mb-3"
                  style={{
                    fontFamily: '"Graphik", system-ui, sans-serif',
                    fontSize: "0.7rem",
                    letterSpacing: "0.15em",
                  }}
                >
                  Verdict
                </p>
                {post.verdict && (
                  <p
                    className="text-zinc-200 leading-snug"
                    style={{
                      fontFamily: '"Schnyder S", Georgia, serif',
                      fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)",
                    }}
                  >
                    {post.verdict}
                  </p>
                )}
                <img
                  src="/sweetie-sticker.svg"
                  alt="Sweetie or Not"
                  className="hidden lg:block pointer-events-none select-none mt-6"
                  style={{
                    width: "clamp(14rem, 22vw, 22rem)",
                    height: "clamp(14rem, 22vw, 22rem)",
                    transform: "rotate(8deg)",
                  }}
                />
              </div>

              {/* Coming up */}
              <div>
                <p
                  className="text-zinc-500 uppercase tracking-widest mb-3"
                  style={{
                    fontFamily: '"Graphik", system-ui, sans-serif',
                    fontSize: "0.7rem",
                    letterSpacing: "0.15em",
                  }}
                >
                  Coming up
                </p>
                <div className="space-y-2">
                  {UPCOMING.map((name) => (
                    <p
                      key={name}
                      className="text-zinc-600"
                      style={{
                        fontFamily: '"Graphik", system-ui, sans-serif',
                        fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)",
                      }}
                    >
                      {name}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
