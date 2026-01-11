"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { gsap } from "gsap"
import PoemDisplay from "@/components/PoemDisplay"
import PoemAudioPlayer from "@/components/PoemAudioPlayer"
import GlobalSearch from "@/components/GlobalSearch"
import Breadcrumb from "@/components/Breadcrumb"
import ToolsDropdown from "@/components/ToolsDropdown"

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
  const [collectionPoems, setCollectionPoems] = useState<Poem[]>([])
  const [showLineNumbers, setShowLineNumbers] = useState(false)
  const [showAudioPlayer, setShowAudioPlayer] = useState(false)
  const [isSearchActive, setIsSearchActive] = useState(false)
  const currentSlugRef = useRef<string | null>(null)
  const isInitialLoadRef = useRef(true)

  useEffect(() => {
    if (params.slug) {
      // Only animate if this is a route change, not the initial load
      const shouldAnimate =
        currentSlugRef.current !== null &&
        currentSlugRef.current !== params.slug

      if (shouldAnimate) {
        // Fade out before fetching new poem
        gsap.to(".poem-content", {
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
          onComplete: () => {
            // Fetch after fade out completes
            fetchPoem()
          },
        })
      } else {
        // Initial load or same poem - fetch immediately without animation
        fetchPoem()
      }
    }

    function fetchPoem() {
      fetch(`/api/poem/${params.slug}`)
        .then((res) => res.json())
        .then((data) => {
          setPoem(data.poem)
          currentSlugRef.current = data.poem.slug

          // If poem has a collection, fetch all poems to find collection siblings
          if (data.poem.collection) {
            fetch("/api/poems")
              .then((res) => res.json())
              .then((allData) => {
                // Include current poem in the collection list
                const siblings = allData.poems.filter(
                  (p: Poem) => p.collection === data.poem.collection
                )
                setCollectionPoems(siblings)
              })
          } else {
            setCollectionPoems([])
          }

          // Fade in the new content (or initial content)
          if (isInitialLoadRef.current) {
            isInitialLoadRef.current = false
            // Gentle fade in on initial load - wait for DOM to be ready
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                gsap.fromTo(
                  ".poem-content",
                  { opacity: 0 },
                  { opacity: 1, duration: 0.6, ease: "power2.out" }
                )
              })
            })
          } else {
            // Animate fade in on route changes
            gsap.fromTo(
              ".poem-content",
              { opacity: 0 },
              { opacity: 1, duration: 0.6, ease: "power2.out" }
            )
          }
        })
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

  const hasCollectionSidebar = poem.collection && collectionPoems.length > 0

  return (
    <div className="w-full h-full">
      {isSearchActive ? (
        <div className="px-8 pb-12 pt-16">
          <GlobalSearch />
        </div>
      ) : (
        <div
          className={`flex flex-col lg:flex-row h-full ${
            hasCollectionSidebar ? "" : ""
          }`}
        >
          {/* Main Content */}
          <div
            className={`${
              hasCollectionSidebar ? "lg:w-3/4" : "max-w-full"
            } w-full px-8 pb-12 pt-[.8rem]`}
          >
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

          {/* Collection Sidebar */}
          {hasCollectionSidebar && (
            <div className="lg:w-1/4 w-full lg:border-l lg:border-zinc-800 px-8 pb-12">
              <div className="lg:sticky lg:top-[7rem]">
                <h3
                  className="text-xs uppercase tracking-wider text-zinc-500 mb-4"
                  style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
                >
                  {poem.collection}
                </h3>
                <ul className="space-y-3 list-none pl-0">
                  {collectionPoems.map((collectionPoem) => (
                    <li key={collectionPoem.slug} className="pl-0">
                      {collectionPoem.slug === poem.slug ? (
                        <div className="text-zinc-100 text-base block cursor-default">
                          <div className="font-medium">
                            {collectionPoem.title}
                          </div>
                        </div>
                      ) : (
                        <Link
                          href={`/poems/${collectionPoem.slug}`}
                          className="text-zinc-400 hover:text-zinc-100 transition-colors text-base block"
                        >
                          <div className="font-medium">
                            {collectionPoem.title}
                          </div>
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
