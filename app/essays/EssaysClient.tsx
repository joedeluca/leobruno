"use client"

import Link from "next/link"
import { useEffect, useRef, useState, useCallback } from "react"
import { gsap } from "gsap"

export interface EssayItem {
  slug: string
  title: string
  date: string
  category: string
  href: string
}

export default function EssaysClient({ initialItems }: { initialItems: EssayItem[] }) {
  const listRef = useRef<HTMLDivElement>(null)
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set())
  const [hoveredFilter, setHoveredFilter] = useState<string | null>(null)
  const [visibleItems, setVisibleItems] = useState<EssayItem[]>(initialItems)
  const animating = useRef(false)

  // Derive unique categories from items (preserving first-seen order)
  const categories = Array.from(
    initialItems.reduce((acc, item) => {
      acc.add(item.category)
      return acc
    }, new Set<string>())
  )

  // Initial fade in
  useEffect(() => {
    if (!listRef.current) return
    const els = listRef.current.querySelectorAll(".fade-title")
    gsap.fromTo(els, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: "power2.out", delay: 0.1 })
  }, [])

  const applyFilter = useCallback((filters: Set<string>) => {
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
          : initialItems.filter(i => filters.has(i.category))
        setVisibleItems(next)
      }
    })
  }, [initialItems])

  // Fade in after visibleItems updates
  useEffect(() => {
    if (!listRef.current) return
    if (!animating.current) return
    const els = listRef.current.querySelectorAll(".fade-title")
    gsap.fromTo(els, { opacity: 0 }, {
      opacity: 1,
      duration: 0.5,
      ease: "power2.out",
      onComplete: () => { animating.current = false }
    })
  }, [visibleItems])

  const handleFilter = (cat: string) => {
    const next = new Set(activeFilters)
    if (next.has(cat)) next.delete(cat)
    else next.add(cat)
    setActiveFilters(next)
    setHoveredFilter(null)
    applyFilter(next)
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-8 pb-48 pt-24 text-center">
      {/* Filter row */}
      <div className="flex flex-wrap justify-center gap-6 md:gap-8 mb-16">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleFilter(cat)}
            onMouseEnter={() => setHoveredFilter(cat)}
            onMouseLeave={() => setHoveredFilter(null)}
            className="home-filter-btn"
            style={{
              fontFamily: '"Graphik", system-ui, sans-serif',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: activeFilters.has(cat) ? '#EDD9B8' : hoveredFilter === cat ? '#8C7F72' : '#5a4a3a',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: 'color 0.25s ease',
            }}
          >
            {cat}
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
              fontSize: 'clamp(1.9rem, 7vw, 5rem)',
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
