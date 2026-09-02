"use client"

import { useEffect, useState } from "react"
import { gsap } from "gsap"
import PoemDisplay from "@/components/PoemDisplay"
import PoemAudioPlayer from "@/components/PoemAudioPlayer"
import GlobalSearch from "@/components/GlobalSearch"
import Breadcrumb from "@/components/Breadcrumb"
import ToolsDropdown from "@/components/ToolsDropdown"
import type { Poem } from "@/lib/poems"

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

export default function PoemPageClient({ poem }: { poem: Poem }) {
  const [showLineNumbers, setShowLineNumbers] = useState(false)
  const [showAudioPlayer, setShowAudioPlayer] = useState(false)
  const [isSearchActive, setIsSearchActive] = useState(false)

  // The poem arrives as a prop now, so this only fades it in — it no longer
  // decides whether there is anything to show.
  useEffect(() => {
    gsap.fromTo(
      ".poem-content",
      { opacity: 0 },
      { opacity: 1, duration: 0.6, ease: "power2.out" }
    )
    const timer = setTimeout(() => {
      window.dispatchEvent(new CustomEvent("clearSearch"))
    }, 50)
    return () => clearTimeout(timer)
  }, [poem.slug])

  // Listen for search queries from header
  useEffect(() => {
    const handleSearchQuery = (event: Event) => {
      const customEvent = event as CustomEvent<{ query: string }>
      setIsSearchActive(Boolean(customEvent.detail.query.trim()))
    }

    window.addEventListener("searchQuery", handleSearchQuery)
    return () => window.removeEventListener("searchQuery", handleSearchQuery)
  }, [])

  const audioUrl = generateAudioUrl(poem.title, poem.author)
  const contentWithEpigraph = poem.epigraph
    ? `[EPIGRAPH]\n${poem.epigraph}\n[/EPIGRAPH]\n\n${poem.content}`
    : poem.content

  return (
    <div className="w-full h-full">
      {isSearchActive ? (
        <div className="px-8 pb-12 pt-16">
          <GlobalSearch />
        </div>
      ) : (
        <div className="flex flex-col h-full">
          {/* Main Content */}
          <div className="w-full px-8 pb-12 pt-[.8rem]">
            <div className="poem-content" style={{ opacity: 0 }}>
              <div className="flex items-start justify-between mb-6">
                <Breadcrumb
                  items={[
                    { label: "Home", href: "/" },
                    { label: "Poems", href: "/poems" },
                    { label: poem.title, href: "" },
                  ]}
                />
                <ToolsDropdown
                  showLineNumbers={showLineNumbers}
                  showAudioPlayer={showAudioPlayer}
                  onToggleLineNumbers={() =>
                    setShowLineNumbers(!showLineNumbers)
                  }
                  onToggleAudioPlayer={() =>
                    setShowAudioPlayer(!showAudioPlayer)
                  }
                  align="right"
                />
              </div>

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
              </div>

              {poem.collection && (
                <div className="text-sm text-zinc-400 italic mb-8">
                  from {poem.collection} ({poem.date})
                </div>
              )}

              <div className="mt-8">
                {showAudioPlayer && <PoemAudioPlayer audioUrl={audioUrl} />}
                <PoemDisplay
                  content={contentWithEpigraph}
                  showLineNumbers={showLineNumbers}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
