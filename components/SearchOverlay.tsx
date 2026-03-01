"use client"

import { useEffect, useState, useRef, useCallback } from "react"
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

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim()
}

function extractMatchContext(text: string, query: string): string {
  if (!text || !query) return ""
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const regex = query.includes(" ")
    ? new RegExp(escaped, "i")
    : new RegExp(`\\b${escaped}\\b`, "i")
  const match = regex.exec(text)
  if (!match) return ""
  const start = Math.max(0, match.index - 150)
  const end = Math.min(text.length, match.index + query.length + 150)
  let snippet = text.slice(start, end)
  if (start > 0) snippet = "…" + snippet
  if (end < text.length) snippet = snippet + "…"
  return snippet.trim()
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const regex = new RegExp(`(${escaped})`, "gi")
  return text.split(regex).map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className="bg-transparent text-white font-semibold">{part}</mark>
      : part
  )
}

function filterPosts(posts: Post[], query: string): Post[] {
  if (!query.trim()) return []
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const regex = query.includes(" ")
    ? new RegExp(escaped, "i")
    : new RegExp(`\\b${escaped}\\b`, "i")

  const results: Post[] = []
  for (const post of posts) {
    const cleanContent = post.content ? stripHtml(post.content) : ""
    const titleMatch = regex.test(post.title)
    const excerptMatch = post.excerpt ? regex.test(post.excerpt) : false
    const contentMatch = cleanContent ? regex.test(cleanContent) : false

    if (titleMatch || excerptMatch || contentMatch) {
      let matchSnippet = ""
      if (contentMatch && cleanContent) {
        matchSnippet = extractMatchContext(cleanContent, query) || post.excerpt || ""
      } else if (excerptMatch && post.excerpt) {
        matchSnippet = post.excerpt
      } else {
        matchSnippet = post.excerpt || ""
      }
      results.push({ ...post, matchSnippet })
    }
  }
  return results
}

export default function SearchOverlay() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [posts, setPosts] = useState<Post[]>([])
  const [results, setResults] = useState<Post[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Fetch posts once
  useEffect(() => {
    fetch("/api/posts")
      .then((r) => r.json())
      .then((d) => setPosts(d.posts || d))
  }, [])

  const openOverlay = useCallback(() => {
    setOpen(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [])

  const closeOverlay = useCallback(() => {
    setOpen(false)
    setQuery("")
    setResults([])
  }, [])

  // ⌘K / Ctrl+K global listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        openOverlay()
      }
      if (e.key === "Escape" && open) {
        closeOverlay()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, openOverlay, closeOverlay])

  // Also listen for openSearch custom event (so other components can trigger it)
  useEffect(() => {
    const handler = () => openOverlay()
    window.addEventListener("openSearch", handler)
    return () => window.removeEventListener("openSearch", handler)
  }, [openOverlay])

  // Filter on query change
  useEffect(() => {
    const filtered = filterPosts(posts, query)
    setResults(filtered)

    if (resultsRef.current && filtered.length > 0) {
      const items = resultsRef.current.querySelectorAll(".search-result")
      gsap.fromTo(
        items,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.3, stagger: 0.05, ease: "power2.out" }
      )
    }
  }, [query, posts])

  // Animate overlay in/out
  useEffect(() => {
    if (!overlayRef.current) return
    if (open) {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.18, ease: "power2.out" })
    }
  }, [open])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex flex-col items-center"
      style={{ backgroundColor: "rgba(9,9,11,0.88)", backdropFilter: "blur(12px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) closeOverlay() }}
    >
      {/* Input card */}
      <div className="w-full max-w-2xl mt-[9rem] px-6">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="text"
          placeholder="Search…"
          className="w-full bg-transparent border-none outline-none focus:ring-0 text-3xl text-zinc-100 placeholder:text-zinc-700 pb-4"
          style={{
            fontFamily: '"Schnyder S", Georgia, serif',
            borderBottom: "1px solid #3A2E24",
          }}
        />
      </div>

      {/* Results */}
      <div
        ref={resultsRef}
        className="w-full max-w-2xl px-6 mt-10 overflow-y-auto"
        style={{ maxHeight: "60vh" }}
      >
        {query.trim() && results.length === 0 && (
          <p
            className="text-zinc-600 text-base"
            style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
          >
            Nothing found.
          </p>
        )}

        {results.map((post) => (
          <Link
            key={post.slug}
            href={`/${post.slug}`}
            onClick={closeOverlay}
            className="search-result block mb-10 group"
          >
            <p
              className="text-xs uppercase tracking-widest text-zinc-600 mb-1"
              style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
            >
              {formatDate(post.date)}
            </p>
            <h2
              className="text-3xl leading-tight text-zinc-200 group-hover:text-white transition-colors mb-2"
              style={{ fontFamily: '"Schnyder S", Georgia, serif' }}
            >
              {highlightText(post.title, query)}
            </h2>
            {post.matchSnippet && (
              <p
                className="text-base text-zinc-500 leading-relaxed"
                style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
              >
                {highlightText(post.matchSnippet, query)}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
