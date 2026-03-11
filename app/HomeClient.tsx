"use client"

import Link from "next/link"
import { useEffect, useRef, useState, useCallback } from "react"
import { gsap } from "gsap"

export interface HomeItem {
  slug: string
  title: string
  date: string
  category: string
  href: string
}

const FILTERS = ["Essays", "Fiction", "Poetry"] as const
type Filter = typeof FILTERS[number]

function matchesFilter(item: HomeItem, filter: Filter): boolean {
  switch (filter) {
    case "Fiction":  return item.category === "Fiction"
    case "Poetry":   return item.category === "Poetry" || item.category === "Poem"
    case "Essays":   return item.category !== "Fiction" && item.category !== "Poetry" && item.category !== "Poem"
  }
}

export default function HomeClient({ initialItems }: { initialItems: HomeItem[] }) {
  const listRef = useRef<HTMLDivElement>(null)
  const [activeFilters, setActiveFilters] = useState<Set<Filter>>(new Set())
  const [visibleItems, setVisibleItems] = useState<HomeItem[]>(initialItems)
  const animating = useRef(false)

  // Initial fade in
  useEffect(() => {
    if (!listRef.current) return
    const els = listRef.current.querySelectorAll(".fade-title")
    gsap.fromTo(els, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: "power2.out", delay: 0.1 })
  }, [])

  const applyFilter = useCallback((filters: Set<Filter>) => {
    if (animating.current || !listRef.current) return
    animating.current = true
    const els = listRef.current.querySelectorAll(".fade-title")
    gsap.to(els, {
      opacity: 0,
      duration: 0.25,
      ease: "power2.in",
      onComplete: () => {
        const next = filters.size === 0
          ? initialItems
          : initialItems.filter(i => [...filters].some(f => matchesFilter(i, f)))
        setVisibleItems(next)
      }
    })
  }, [initialItems])

  // Fade in after visibleItems updates
  useEffect(() => {
    if (!listRef.current) return
    const els = listRef.current.querySelectorAll(".fade-title")
    if (!animating.current) return
    gsap.fromTo(els, { opacity: 0 }, {
      opacity: 1,
      duration: 0.5,
      ease: "power2.out",
      onComplete: () => { animating.current = false }
    })
  }, [visibleItems])

  const handleFilter = (f: Filter) => {
    const next = new Set(activeFilters)
    if (next.has(f)) next.delete(f)
    else next.add(f)
    setActiveFilters(next)
    applyFilter(next)
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-8 pb-48 pt-24 text-center">
      {/* Filter row */}
      <div className="flex gap-8 mb-16">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => handleFilter(f)}
            style={{
              fontFamily: '"Graphik", system-ui, sans-serif',
              fontSize: '17px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: activeFilters.has(f) ? '#EDD9B8' : '#5a4a3a',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: 'color 0.25s ease',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Titles */}
      <div ref={listRef}>
        {visibleItems.map((item, i) => (
          <Link
            key={item.slug}
            href={item.href}
            className="fade-title"
            style={{
              fontFamily: '"Schnyder S", Georgia, serif',
              fontSize: 'clamp(2.5rem, 7vw, 5rem)',
              color: '#EDD9B8',
              lineHeight: 1.1,
              display: 'block',
              marginBottom: i < visibleItems.length - 1 ? '2.5rem' : 0,
              opacity: 0,
            }}
          >
            {item.title}
          </Link>
        ))}
      </div>
    </div>
  )
}

