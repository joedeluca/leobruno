"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { gsap } from "gsap"

interface Poem {
  slug: string
  title: string
  author: string
  date: string
  collection?: string
}

export default function PoemsIndex() {
  const [poems, setPoems] = useState<Poem[]>([])
  const [groupedPoems, setGroupedPoems] = useState<Record<string, Poem[]>>({})

  useEffect(() => {
    fetch("/api/poems")
      .then((res) => res.json())
      .then((data) => {
        setPoems(data.poems)

        // Group poems by author
        const grouped = data.poems.reduce(
          (acc: Record<string, Poem[]>, poem: Poem) => {
            if (!acc[poem.author]) {
              acc[poem.author] = []
            }
            acc[poem.author].push(poem)
            return acc
          },
          {}
        )
        setGroupedPoems(grouped)
      })
  }, [])

  useEffect(() => {
    if (Object.keys(groupedPoems).length > 0) {
      gsap.fromTo(
        ".poem-group",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" }
      )
    }
  }, [groupedPoems])

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1
          className="text-5xl font-bold text-zinc-100 mb-4"
          style={{ fontFamily: '"Schnyder S", Georgia, serif' }}
        >
          Poems
        </h1>
        <p className="text-lg text-zinc-400 mb-12">
          A collection of poems from the public domain
        </p>

        <div className="space-y-12">
          {Object.entries(groupedPoems).map(([author, authorPoems]) => (
            <div key={author} className="poem-group">
              <h2
                className="text-2xl font-bold text-zinc-300 mb-4 border-b border-zinc-800 pb-2"
                style={{ fontFamily: '"Schnyder S", Georgia, serif' }}
              >
                {author}
              </h2>
              <ul className="space-y-3">
                {authorPoems.map((poem) => (
                  <li key={poem.slug}>
                    <Link
                      href={`/poems/${poem.slug}`}
                      className="group flex items-baseline justify-between hover:text-zinc-100 transition-colors"
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
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
