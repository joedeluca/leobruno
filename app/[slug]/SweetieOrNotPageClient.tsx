"use client"

import { useEffect, useState, useRef } from "react"
import { gsap } from "gsap"
import GlobalSearch from "@/components/GlobalSearch"
import { formatArticleDate, formatShortDate } from "@/lib/formatDate"
import PostReadTracker from "./PostReadTracker"
import ArticleTrace, { TraceButton } from "@/components/ArticleTrace"
import SweetieVote from "@/components/SweetieVote"
import type { Post } from "@/lib/posts"

function renderContent(html: string) {
  return <span dangerouslySetInnerHTML={{ __html: html }} />
}

export default function SweetieOrNotPageClient({ post, allEpisodes = [] }: { post: Post; allEpisodes?: Post[] }) {
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
          <div className="lg:w-3/4 w-full px-8 pb-12 pt-12 lg:pr-8 lg:border-r lg:border-[#3A2E24]">
            <header className="mb-12">
              <h5
                className="text-zinc-300 uppercase tracking-wide flex"
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
                </a>&nbsp;{"|"}&nbsp;
                <span className="hidden max-sm:flex">{post.teaserShort}</span>
                <span className="max-sm:hidden">{post.teaser}</span>
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
                {/* Mobile: just Leo */}
                <span className="lg:hidden" style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}>
                  Leo
                </span>
                {/* Desktop: Leo Bruno */}
                <span className="hidden lg:inline" style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}>
                  Leo Bruno
                </span>{" "}
                {/* Mobile: short date */}
                <span className="lg:hidden">| {formatShortDate(post.date)}</span>
                {/* Desktop: full date */}
                <span className="hidden lg:inline">| {formatArticleDate(post.date)}</span>
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
                src={post.stickerImage || "/sweetie-sticker.svg"}
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

            {/* Mobile-only vote widget */}
            <div className="lg:hidden">
              <SweetieVote episodeSlug={post.slug} />
            </div>
          </div>

          {/* Col 2 — verdict, sticker, coming up */}
          <aside className="lg:w-1/4 w-full px-8 pb-12 pt-4 lg:pt-12 lg:pl-8 mt-2 lg:mt-0 sm:[background:linear-gradient(160deg,#0C0A08_0%,#3A2E24_50%,#0C0A08_100%)]">
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
                  {post.person ? `${post.person} verdict` : "Verdict"}
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

              </div>

              {/* Vote */}
              <div className="hidden lg:block">
                <SweetieVote episodeSlug={post.slug} compact />
              </div>

              {/* Episode list */}
              <div>
                <p
                  className="text-zinc-500 uppercase tracking-widest mb-3"
                  style={{
                    fontFamily: '"Graphik", system-ui, sans-serif',
                    fontSize: "0.7rem",
                    letterSpacing: "0.15em",
                  }}
                >
                  Episodes
                </p>
                <div className="space-y-2">
                  {allEpisodes.map((ep) => (
                    <a
                      key={ep.slug}
                      href={`/${ep.slug}`}
                      className={`block transition-colors ${
                        ep.slug === post.slug
                          ? "text-zinc-200"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                      style={{
                        fontFamily: '"Graphik", system-ui, sans-serif',
                        fontSize: "clamp(0.85rem, 1.5vw, 1rem)",
                      }}
                    >
                      {ep.title}
                    </a>
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
