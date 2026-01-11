"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { gsap } from "gsap"
import PoemDisplay from "@/components/PoemDisplay"
import PoemAudioPlayer from "@/components/PoemAudioPlayer"
import GlobalSearch from "@/components/GlobalSearch"

interface Poem {
  slug: string
  title: string
  author: string
  date: string
  collection?: string
  epigraph?: string
  content: string
}

function generateAudioUrl(title: string, author: string): string {
  const titleSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  const authorSlug = author
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  return `/audio/poems/${titleSlug}-by-${authorSlug}.m4a`
}

export default function PoemPage() {
  const params = useParams()
  const [poem, setPoem] = useState<Poem | null>(null)
  const [showLineNumbers, setShowLineNumbers] = useState(false)
  const [isSearchActive, setIsSearchActive] = useState(false)

  useEffect(() => {
    if (params.slug) {
      fetch(`/api/poem/${params.slug}`)
        .then((res) => res.json())
        .then((data) => setPoem(data.poem))
    }

    // Clear search when individual poem page mounts
    const timer = setTimeout(() => {
      window.dispatchEvent(new CustomEvent("clearSearch"))
    }, 50)

    return () => clearTimeout(timer)
  }, [params.slug])

  // Listen for search queries from header
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
    if (poem) {
      gsap.fromTo(
        ".poem-content",
        { opacity: 0 },
        { opacity: 1, duration: 0.8, ease: "power2.out" }
      )
    }
  }, [poem])

  if (!poem) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tiepolo-pink-800"></div>
      </div>
    )
  }

  const audioUrl = generateAudioUrl(poem.title, poem.author)
  const contentWithEpigraph = poem.epigraph
    ? `[EPIGRAPH]\n${poem.epigraph}\n[/EPIGRAPH]\n\n${poem.content}`
    : poem.content

  return (
    <div className="min-h-screen bg-zinc-950">
      {isSearchActive ? (
        <div className="px-8 pb-12 pt-16">
          <GlobalSearch />
        </div>
      ) : (
        <div className="max-w-full px-8 py-16">
          <div className="poem-content">
            <h1
              className="text-4xl font-bold text-zinc-50 mb-2"
              style={{ fontFamily: '"Schnyder S", Georgia, serif' }}
            >
              {poem.title}
            </h1>

            <div className="flex items-center gap-3 mb-2">
              <div
                className="text-sm text-zinc-300 uppercase tracking-wide"
                style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
              >
                BY {poem.author.toUpperCase()}
              </div>
              <button
                onClick={() => setShowLineNumbers(!showLineNumbers)}
                className="text-xs text-zinc-400 hover:text-tiepolo-pink-500 transition-colors uppercase tracking-wide"
                style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
              >
                {showLineNumbers ? "Hide" : "Show"} Line Numbers
              </button>
            </div>

            {poem.collection && (
              <div className="text-sm text-zinc-400 italic mb-8">
                from {poem.collection} ({poem.date})
              </div>
            )}

            <div className="mt-8">
              <PoemAudioPlayer audioUrl={audioUrl} />
              <PoemDisplay
                content={contentWithEpigraph}
                showLineNumbers={showLineNumbers}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
