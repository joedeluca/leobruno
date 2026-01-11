"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { gsap } from "gsap"
import CollectionAccordion from "@/components/CollectionAccordion"
import InlineAudioPlayer from "@/components/InlineAudioPlayer"
import GlobalSearch from "@/components/GlobalSearch"

interface Poem {
  slug: string
  title: string
  author: string
  date: string
  collection?: string
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

interface CollectionGroup {
  name: string
  year: string
  poems: Poem[]
}

export default function PoemsIndex() {
  const [poems, setPoems] = useState<Poem[]>([])
  const [groupedPoems, setGroupedPoems] = useState<
    Record<string, { standalone: Poem[]; collections: CollectionGroup[] }>
  >({})
  const [isSearchActive, setIsSearchActive] = useState(false)

  useEffect(() => {
    fetch("/api/poems")
      .then((res) => res.json())
      .then((data) => {
        setPoems(data.poems)

        // Group poems by author, then by collection
        const grouped = data.poems.reduce(
          (
            acc: Record<
              string,
              { standalone: Poem[]; collections: CollectionGroup[] }
            >,
            poem: Poem
          ) => {
            if (!acc[poem.author]) {
              acc[poem.author] = { standalone: [], collections: [] }
            }

            if (poem.collection) {
              // Find or create collection group
              let collectionGroup = acc[poem.author].collections.find(
                (c) => c.name === poem.collection
              )
              if (!collectionGroup) {
                collectionGroup = {
                  name: poem.collection,
                  year: poem.date,
                  poems: [],
                }
                acc[poem.author].collections.push(collectionGroup)
              }
              collectionGroup.poems.push(poem)
            } else {
              acc[poem.author].standalone.push(poem)
            }

            return acc
          },
          {}
        )
        setGroupedPoems(grouped)
      })

    // Clear search when poems page mounts
    const timer = setTimeout(() => {
      window.dispatchEvent(new CustomEvent("clearSearch"))
    }, 50)

    return () => clearTimeout(timer)
  }, [])

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
    if (Object.keys(groupedPoems).length > 0) {
      gsap.fromTo(
        ".poem-group",
        { opacity: 0 },
        { opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" }
      )
    }
  }, [groupedPoems])

  return (
    <div className="w-full h-full">
      {isSearchActive ? (
        <div className="px-8 pb-12 pt-16">
          <GlobalSearch />
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row h-full">
          {/* Main Content - 75% on desktop */}
          <div className="lg:w-3/4 w-full px-8 pb-12 pt-[.8rem]">
            <h1
              className="text-5xl font-bold text-zinc-100 mb-4"
              style={{ fontFamily: '"Schnyder S", Georgia, serif' }}
            >
              Poems
            </h1>
            <p className="text-lg text-zinc-400 mb-12">
              A collection of poems referenced on the site and in the public
              domain
            </p>

            <div className="space-y-12">
              {Object.entries(groupedPoems).map(
                ([author, { standalone, collections }]) => (
                  <div key={author} className="poem-group">
                    <h2
                      className="text-2xl font-bold text-zinc-300 mb-4 border-b border-zinc-800 pb-2"
                      style={{ fontFamily: '"Schnyder S", Georgia, serif' }}
                    >
                      {author}
                    </h2>

                    <div className="space-y-4">
                      {/* Collections with multiple poems */}
                      {collections.map((collection) => {
                        if (collection.poems.length > 1) {
                          return (
                            <CollectionAccordion
                              key={collection.name}
                              collectionName={collection.name}
                              collectionYear={collection.year}
                              poems={collection.poems}
                            />
                          )
                        }
                        return null
                      })}

                      {/* Standalone poems and single-poem collections */}
                      <ul className="space-y-3 list-none pl-0">
                        {/* Single poems from collections */}
                        {collections.map((collection) => {
                          if (collection.poems.length === 1) {
                            const poem = collection.poems[0]
                            return (
                              <li key={poem.slug} className="pl-0">
                                <Link
                                  href={`/poems/${poem.slug}`}
                                  className="group flex items-baseline justify-between hover:text-zinc-100 transition-colors normal-text"
                                >
                                  <span className="text-zinc-400 group-hover:text-zinc-100 transition-colors">
                                    {poem.title}
                                  </span>
                                  {poem.collection && (
                                    <span className="text-sm text-zinc-600 italic ml-4">
                                      {poem.collection}
                                    </span>
                                  )}
                                </Link>
                              </li>
                            )
                          }
                          return null
                        })}

                        {/* Standalone poems without collection */}
                        {standalone.map((poem) => (
                          <li key={poem.slug} className="pl-0">
                            <Link
                              href={`/poems/${poem.slug}`}
                              className="text-zinc-400 hover:text-zinc-100 transition-colors normal-text"
                            >
                              {poem.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Sidebar - 25% on desktop */}
          <div className="lg:w-1/4 w-full lg:border-l lg:border-zinc-800 px-8 pb-12">
            <div className="lg:sticky lg:top-[7rem]">
              <h3
                className="text-xs uppercase tracking-wider text-zinc-500 mb-4"
                style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
              >
                Recent Additions
              </h3>
              <ul className="space-y-3 list-none pl-0">
                {poems
                  .slice()
                  .reverse()
                  .map((poem) => {
                    const audioUrl = generateAudioUrl(poem.title, poem.author)
                    return (
                      <li key={poem.slug} className="pl-0">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/poems/${poem.slug}`}
                            className="text-zinc-400 hover:text-zinc-100 transition-colors text-base block flex-1"
                          >
                            <div className="font-medium">{poem.title}</div>
                            <div className="text-sm text-zinc-600">
                              {poem.author}
                            </div>
                          </Link>
                          <div className="pt-0.5">
                            <InlineAudioPlayer
                              audioUrl={audioUrl}
                              title={poem.title}
                              author={poem.author}
                            />
                          </div>
                        </div>
                      </li>
                    )
                  })}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
